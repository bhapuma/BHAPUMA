import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { BhapumaOrb } from './components/BhapumaOrb';
import { AvyanProfileCard } from './components/AvyanProfileCard';
import { BottomControls } from './components/BottomControls';
import { CallConfirmationDialog } from './components/CallConfirmationDialog';
import { SMSComposerDialog } from './components/SMSComposerDialog';
import { WhatsAppComposerDialog } from './components/WhatsAppComposerDialog';
import { EmailComposerDialog } from './components/EmailComposerDialog';
import { ActiveAppModal } from './components/ActiveAppModal';
import { ScreenFlashlight } from './components/ScreenFlashlight';
import { SettingsModal } from './components/SettingsModal';
import { MemoryModal } from './components/MemoryModal';
import { PermissionsModal } from './components/PermissionsModal';
import { AboutModal } from './components/AboutModal';

import {
  AssistantState,
  ContactItem,
  DeviceTelemetry,
  InstalledApp,
  PermissionStatus,
  UserMemory,
} from './types';
import {
  DEFAULT_CONTACTS,
  DEFAULT_INSTALLED_APPS,
  getRealBatteryInfo,
  loadUserMemory,
  saveUserMemory,
  clearAllUserMemory,
  parseLocalOfflineCommand,
  setHardwareFlashlight,
} from './utils/deviceTools';
import { getNaturalNepaliTime, getNaturalNepaliDate } from './utils/nepaliTime';
import { speechEngine } from './utils/speechEngine';
import { wakeWordDetector } from './utils/wakeWord';
import { Volume2, Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react';
import { App as CapApp } from '@capacitor/app';

export default function App() {
  // Assistant States
  const [assistantState, setAssistantState] = useState<AssistantState>('IDLE');
  const [isListening, setIsListening] = useState(false);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  // Device & Telemetry States
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>({
    batteryLevel: 85,
    isCharging: false,
    isOnline: navigator.onLine,
    volumeLevel: 75,
    flashlightOn: false,
  });

  const [nepaliClock, setNepaliClock] = useState('');
  const [userMemory, setUserMemory] = useState<UserMemory>(loadUserMemory);
  const [contacts, setContacts] = useState<ContactItem[]>(DEFAULT_CONTACTS);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>(DEFAULT_INSTALLED_APPS);

  const [permissions, setPermissions] = useState<PermissionStatus>({
    microphone: true,
    contacts: true,
    phone: true,
    notifications: true,
    cameraTorch: true,
  });

  // Transient Voice Transcript (Subtle, non-intrusive banner)
  const [liveTranscript, setLiveTranscript] = useState('');
  const [spokenFeedback, setSpokenFeedback] = useState('');
  const transcriptTimeoutRef = useRef<any>(null);

  // Active Dialogs & Modals
  const [pendingCallContact, setPendingCallContact] = useState<ContactItem | null>(null);
  const [pendingCallNumber, setPendingCallNumber] = useState<string>('');

  const [smsData, setSmsData] = useState<{ recipientName: string; phoneNumber: string; message: string } | null>(null);
  const [whatsAppData, setWhatsAppData] = useState<{ recipientName: string; phoneNumber: string; message: string } | null>(null);
  const [emailData, setEmailData] = useState<{ recipientEmail: string; recipientName: string; subject: string; body: string } | null>(null);

  const [activeApp, setActiveApp] = useState<InstalledApp | null>(null);
  const [appQuery, setAppQuery] = useState<string>('');

  const [showSettings, setShowSettings] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [exitToast, setExitToast] = useState(false);
  const lastBackPressRef = useRef<number>(0);

  const conversationHistoryRef = useRef<{ role: string; content: string }[]>([]);

  // Safe Android / PWA Back Button Action Handler
  const handleBackAction = useCallback(() => {
    // 1. If any modal is active, close it first without navigating away
    if (activeApp) {
      setActiveApp(null);
      setAppQuery('');
      return true;
    }
    if (smsData) {
      setSmsData(null);
      return true;
    }
    if (whatsAppData) {
      setWhatsAppData(null);
      return true;
    }
    if (emailData) {
      setEmailData(null);
      return true;
    }
    if (pendingCallContact || pendingCallNumber) {
      setPendingCallContact(null);
      setPendingCallNumber('');
      return true;
    }
    if (showSettings) {
      setShowSettings(false);
      return true;
    }
    if (showMemory) {
      setShowMemory(false);
      return true;
    }
    if (showPermissions) {
      setShowPermissions(false);
      return true;
    }
    if (showAbout) {
      setShowAbout(false);
      return true;
    }
    if (telemetry.flashlightOn) {
      setTelemetry((p) => ({ ...p, flashlightOn: false }));
      setHardwareFlashlight(false);
      return true;
    }

    // 2. Main screen: Prevent accidental exit on Home Screen / PWA (Double-Tap to Exit)
    const now = Date.now();
    if (now - lastBackPressRef.current < 2000) {
      try {
        CapApp.exitApp();
      } catch {
        // In web browser, allow normal close
      }
      return false;
    } else {
      lastBackPressRef.current = now;
      setExitToast(true);
      setTimeout(() => setExitToast(false), 2200);
      return true;
    }
  }, [
    activeApp,
    smsData,
    whatsAppData,
    emailData,
    pendingCallContact,
    pendingCallNumber,
    showSettings,
    showMemory,
    showPermissions,
    showAbout,
    telemetry.flashlightOn,
  ]);

  // Trap back navigation gestures in browser and Capacitor
  useEffect(() => {
    try {
      window.history.replaceState({ page: 'bhapuma_root' }, '', window.location.href);
      window.history.pushState({ page: 'bhapuma_active' }, '', window.location.href);
    } catch (e) {
      console.warn('History state setup warning:', e);
    }

    const onPopState = (e: PopStateEvent) => {
      // Prevent popstate from propagating or exiting if on main screen
      if (e) {
        e.preventDefault();
      }
      const handled = handleBackAction();
      if (handled) {
        try {
          window.history.pushState({ page: 'bhapuma_active' }, '', window.location.href);
        } catch {}
      }
    };

    window.addEventListener('popstate', onPopState);

    let capBackButtonHandler: any = null;
    try {
      capBackButtonHandler = CapApp.addListener('backButton', () => {
        handleBackAction();
      });
    } catch (e) {
      console.warn('Capacitor backButton init non-fatal:', e);
    }

    return () => {
      window.removeEventListener('popstate', onPopState);
      if (capBackButtonHandler?.then) {
        capBackButtonHandler.then((h: any) => h?.remove?.());
      }
    };
  }, [handleBackAction]);

  // Update real-time clock & battery
  useEffect(() => {
    const updateTime = () => {
      const { formattedTime } = getNaturalNepaliTime();
      setNepaliClock(formattedTime);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);

    getRealBatteryInfo().then((info) => {
      setTelemetry((prev) => ({
        ...prev,
        batteryLevel: info.level,
        isCharging: info.charging,
      }));
    });

    const handleOnline = () => setTelemetry((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setTelemetry((prev) => ({ ...prev, isOnline: false }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize SpeechEngine listener
  useEffect(() => {
    speechEngine.setSpeakingListener((speaking) => {
      if (speaking) {
        setAssistantState('SPEAKING');
      } else {
        setAssistantState((prev) => (prev === 'SPEAKING' ? 'IDLE' : prev));
      }
    });
  }, []);

  // Handle Assistant Spoken Response with natural voice and subtitle
  const respondWithVoice = useCallback(async (text: string) => {
    setSpokenFeedback(text);
    setAssistantState('SPEAKING');
    await speechEngine.speak(text);
  }, []);

  // Tool Call Execution Engine on Client
  const executeDeviceTool = useCallback(
    async (toolName: string, args: Record<string, any>): Promise<string> => {
      switch (toolName) {
        case 'openApp': {
          const appName = args.appName || '';
          const match = installedApps.find(
            (a) =>
              a.name.toLowerCase().includes(appName.toLowerCase()) ||
              a.nameNepali.toLowerCase().includes(appName.toLowerCase()) ||
              a.id.toLowerCase().includes(appName.toLowerCase())
          );
          if (match) {
            setActiveApp(match);
            return `${match.name} एप खोल्दैछु।`;
          }
          return `माफ गर्नुहोस्, ${appName} एप भेटिएन।`;
        }

        case 'searchContact':
        case 'getContactDetails': {
          const nameQuery = args.contactName || '';
          const contact = contacts.find(
            (c) =>
              c.name.toLowerCase().includes(nameQuery.toLowerCase()) ||
              c.nameNepali.toLowerCase().includes(nameQuery.toLowerCase())
          );
          if (contact) {
            return `${contact.nameNepali || contact.name} को फोन नम्बर ${contact.phoneNumber} हो।`;
          }
          return `मलाई ${nameQuery} को contact भेटिएन।`;
        }

        case 'callContact': {
          const nameQuery = args.contactName || '';
          const contact = contacts.find(
            (c) =>
              c.name.toLowerCase().includes(nameQuery.toLowerCase()) ||
              c.nameNepali.toLowerCase().includes(nameQuery.toLowerCase())
          );
          const num = args.phoneNumber || contact?.phoneNumber;
          if (contact || num) {
            setPendingCallContact(contact || null);
            setPendingCallNumber(num || '');
            return `${contact ? contact.nameNepali || contact.name : num} लाई call गर्न लाग्दैछु। Call गरौँ?`;
          }
          return `मलाई ${nameQuery} को सम्पर्क नम्बर भेटिएन।`;
        }

        case 'composeSMS': {
          const nameQuery = args.contactName || '';
          const contact = contacts.find(
            (c) =>
              c.name.toLowerCase().includes(nameQuery.toLowerCase()) ||
              c.nameNepali.toLowerCase().includes(nameQuery.toLowerCase())
          );
          const phone = args.phoneNumber || contact?.phoneNumber || '';
          setSmsData({
            recipientName: contact ? contact.nameNepali || contact.name : nameQuery || 'Recipient',
            phoneNumber: phone,
            message: args.message || '',
          });
          return `SMS तयार गरिएको छ।`;
        }

        case 'composeWhatsAppMessage': {
          const nameQuery = args.contactName || '';
          const contact = contacts.find(
            (c) =>
              c.name.toLowerCase().includes(nameQuery.toLowerCase()) ||
              c.nameNepali.toLowerCase().includes(nameQuery.toLowerCase())
          );
          const phone = args.phoneNumber || contact?.phoneNumber || '+977 9841234567';
          setWhatsAppData({
            recipientName: contact ? contact.nameNepali || contact.name : nameQuery || 'Recipient',
            phoneNumber: phone,
            message: args.message || '',
          });
          return `WhatsApp मेसेज तयार गरिएको छ।`;
        }

        case 'composeEmail': {
          setEmailData({
            recipientEmail: args.recipientEmail || 'example@gmail.com',
            recipientName: args.recipientName || 'Recipient',
            subject: args.subject || '',
            body: args.body || '',
          });
          return `इमेल कम्पोजर तयार गरिएको छ।`;
        }

        case 'controlMedia': {
          const action = args.action || 'play';
          if (action === 'search_youtube' || action === 'open_youtube' || args.query) {
            const ytApp = installedApps.find((a) => a.id === 'youtube');
            if (ytApp) {
              setAppQuery(args.query || 'Nepali Hits');
              setActiveApp(ytApp);
            }
            return `YouTube मा ${args.query || ''} खोल्दैछु।`;
          }
          return `म्युजिक नियन्त्रण सम्पन्न भयो।`;
        }

        case 'controlVolume': {
          const action = args.action || 'get_status';
          let newVol = telemetry.volumeLevel;
          if (action === 'increase') newVol = Math.min(100, telemetry.volumeLevel + 15);
          if (action === 'decrease') newVol = Math.max(0, telemetry.volumeLevel - 15);
          if (action === 'max') newVol = 100;
          if (action === 'min') newVol = 0;
          if (args.level !== undefined) newVol = args.level;
          setTelemetry((prev) => ({ ...prev, volumeLevel: newVol }));
          return `भोल्युम ${newVol}% बनाइएको छ।`;
        }

        case 'getBatteryStatus': {
          const status = telemetry.isCharging ? 'चार्ज भइरहेको छ' : 'डिस्चार्ज अवस्थामा छ';
          return `तपाईंको फोनको ब्याट्री ${telemetry.batteryLevel}% छ र यो ${status}।`;
        }

        case 'getCurrentTime': {
          const time = getNaturalNepaliTime();
          return time.spokenText;
        }

        case 'getCurrentDate': {
          const date = getNaturalNepaliDate();
          return date.spokenText;
        }

        case 'controlFlashlight': {
          const action = args.action || 'toggle';
          let enable = !telemetry.flashlightOn;
          if (action === 'on') enable = true;
          if (action === 'off') enable = false;
          setTelemetry((prev) => ({ ...prev, flashlightOn: enable }));
          setHardwareFlashlight(enable);
          return enable ? 'फ्ल्यासलाइट बालेको छु।' : 'फ्ल्यासलाइट बन्द गरेको छु।';
        }

        case 'openSettings': {
          setShowSettings(true);
          return 'सेटिङ्स खोल्दैछु।';
        }

        case 'saveMemory': {
          const key = args.key;
          const val = args.value;
          const updated = { ...userMemory, [key]: val };
          setUserMemory(updated);
          saveUserMemory(updated);
          return `मैले सम्झेँ: ${key} = ${val}`;
        }

        case 'getMemory': {
          const val = userMemory[args.key];
          return val ? `तपाईंको ${args.key} ${val} हो।` : `माफ गर्नुहोस्, त्यो मेमोरीमा भेटिएन।`;
        }

        case 'openAvyanProfile': {
          window.open('https://avyan.app/u/bharat.pun.magar', '_blank');
          return 'भरत पुन मगरको AVYAN Profile खोल्दैछु।';
        }

        default:
          return 'कार्य सम्पन्न गरियो।';
      }
    },
    [contacts, installedApps, telemetry, userMemory]
  );

  // Main Query Processing (Ultra-Fast Real-Time Live Voice & Smart Dispatch)
  const processUserQuery = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Immediately stop any prior speech & acknowledge to feel human-like instant
      speechEngine.stopSpeaking();

      // Show transcript immediately
      setLiveTranscript(text);
      if (transcriptTimeoutRef.current) clearTimeout(transcriptTimeoutRef.current);
      transcriptTimeoutRef.current = setTimeout(() => {
        setLiveTranscript('');
      }, 6000);

      // 1. Instant local matching for fast device & offline commands (Instant 0ms latency)
      const offlineResult = parseLocalOfflineCommand(text, {
        batteryLevel: telemetry.batteryLevel,
        isCharging: telemetry.isCharging,
        volumeLevel: telemetry.volumeLevel,
        flashlightOn: telemetry.flashlightOn,
        contacts,
        installedApps,
        memory: userMemory,
      });

      if (offlineResult.handled) {
        if (offlineResult.action === 'flashlight_on') {
          setTelemetry((p) => ({ ...p, flashlightOn: true }));
          setHardwareFlashlight(true);
        } else if (offlineResult.action === 'flashlight_off') {
          setTelemetry((p) => ({ ...p, flashlightOn: false }));
          setHardwareFlashlight(false);
        } else if (offlineResult.action === 'volume_increase') {
          setTelemetry((p) => ({ ...p, volumeLevel: Math.min(100, p.volumeLevel + 15) }));
        } else if (offlineResult.action === 'volume_decrease') {
          setTelemetry((p) => ({ ...p, volumeLevel: Math.max(0, p.volumeLevel - 15) }));
        } else if (offlineResult.action === 'volume_max') {
          setTelemetry((p) => ({ ...p, volumeLevel: 100 }));
        } else if (offlineResult.action === 'volume_min') {
          setTelemetry((p) => ({ ...p, volumeLevel: 0 }));
        } else if (offlineResult.action === 'open_app' && offlineResult.payload) {
          setActiveApp(offlineResult.payload);
        } else if (offlineResult.action === 'open_settings') {
          setShowSettings(true);
        } else if (offlineResult.action === 'open_avyan') {
          window.open('https://avyan.app/u/bharat.pun.magar', '_blank');
        }

        await respondWithVoice(offlineResult.nepaliResponse);
        return;
      }

      // 2. Real-Time Gemini Live Flow
      setAssistantState('THINKING');

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch('/api/assistant/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            prompt: text,
            conversationHistory: conversationHistoryRef.current,
            deviceContext: {
              batteryLevel: telemetry.batteryLevel,
              isCharging: telemetry.isCharging,
              volumeLevel: telemetry.volumeLevel,
              flashlightOn: telemetry.flashlightOn,
              userMemory: userMemory,
            },
          }),
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error('Gemini API call returned status ' + response.status);
        }

        const data = await response.json();
        let replyText = data.text || '';

        // Execute Function / Tool Calls if present
        if (data.functionCalls && data.functionCalls.length > 0) {
          for (const call of data.functionCalls) {
            const toolResultNepali = await executeDeviceTool(call.name, call.args || {});
            if (!replyText) {
              replyText = toolResultNepali;
            }
          }
        }

        if (!replyText) {
          replyText = 'हजुर, म सुन्दैछु। के मद्दत गरूँ?';
        }

        // Save conversation history
        conversationHistoryRef.current.push({ role: 'user', content: text });
        conversationHistoryRef.current.push({ role: 'assistant', content: replyText });

        await respondWithVoice(replyText);
      } catch (err: any) {
        console.warn('Real-time query fallback to instant natural Nepali response:', err);
        setAssistantState('ERROR');
        // Intelligent quick response
        const fallbackText = offlineResult.nepaliResponse || 'हजुर, म सुन्दैछु। भन्नुहोस् त?';
        await respondWithVoice(fallbackText);
      }
    },
    [telemetry, contacts, installedApps, userMemory, executeDeviceTool, respondWithVoice]
  );

  // Wake Word & Speech Detection Setup
  useEffect(() => {
    wakeWordDetector.onWakeWord((trigger) => {
      // Wake up with any of the 4 wake words
      speechEngine.stopSpeaking();
      setIsListening(true);
      setAssistantState('LISTENING');
      setLiveTranscript(`"${trigger}" सुन्दैछु...`);
    });

    wakeWordDetector.onTranscript((transcript, isFinal) => {
      if (isFinal && transcript.trim().length > 1) {
        processUserQuery(transcript);
      } else {
        setLiveTranscript(transcript);
      }
    });

    wakeWordDetector.onError((err) => {
      console.warn('Wake-word engine notice:', err);
      if (err === 'not-allowed' || err === 'service-not-allowed') {
        setIsListening(false);
        setAssistantState('IDLE');
        setLiveTranscript('माइक्रोफोन अनुमति दिनुहोस्');
        setTimeout(() => setLiveTranscript(''), 4000);
      }
    });
  }, [processUserQuery]);

  // Toggle Assistant Mic (Safe, crash-proof handler without UI navigation triggers)
  const handleToggleMic = async (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      try {
        speechEngine.initAudioContext();
      } catch (e) {
        console.warn('AudioContext init non-fatal:', e);
      }

      if (isListening) {
        setIsListening(false);
        setAssistantState('IDLE');
        wakeWordDetector.stopListening();
      } else {
        setIsListening(true);
        setAssistantState('LISTENING');
        wakeWordDetector.startListening();
        try {
          const analyser = await wakeWordDetector.startMicrophoneCapture();
          if (analyser) {
            setAnalyserNode(analyser);
          }
        } catch (err) {
          console.warn('Microphone stream non-fatal warning:', err);
        }
      }
    } catch (err) {
      console.warn('handleToggleMic error caught safely:', err);
    }
  };

  // Call Confirmation Execution
  const handleConfirmCall = () => {
    const targetNum = pendingCallNumber || pendingCallContact?.phoneNumber || '';
    setPendingCallContact(null);
    setPendingCallNumber('');
    window.open(`tel:${targetNum.replace(/\s+/g, '')}`, '_self');
    respondWithVoice(`${targetNum} मा कल डायल गरिँदैछ।`);
  };

  return (
    <div className="min-h-screen w-full bg-[#030306] text-white flex flex-col justify-between relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Dynamic Background Neon Glow Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-br from-cyan-600/10 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header Bar with BHAPUMA Branding */}
      <HeaderBar
        telemetry={telemetry}
        nepaliTime={nepaliClock}
        isBackgroundActive={isListening}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAbout={() => setShowAbout(true)}
      />

      {/* 2. Main Zero-Touch Voice Assistant Display */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-2 relative z-10">
        {/* Holographic BHAPUMA Orb with dynamic state visualizer */}
        <BhapumaOrb
          state={assistantState}
          onClick={handleToggleMic}
          isListening={isListening}
          analyserNode={analyserNode}
        />

        {/* 4 Official Wake Words / Call Names */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-sm mx-auto">
          {[
            { name: 'भरत', en: 'Bharat', icon: '👤', color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40' },
            { name: 'भपुम', en: 'BHAPUMA', icon: '⚡', color: 'from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/40' },
            { name: 'ह्याकर', en: 'Hacker', icon: '💻', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40' },
            { name: 'कम्प्युटर', en: 'Computer', icon: '🤖', color: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40' },
          ].map((wake) => (
            <button
              key={wake.name}
              onClick={() => {
                speechEngine.initAudioContext();
                processUserQuery(wake.name);
              }}
              className={`px-3 py-1 rounded-xl bg-gradient-to-r ${wake.color} border text-xs font-semibold flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-sm`}
              title={`Say "${wake.name}" (${wake.en}) to activate`}
            >
              <span>{wake.icon}</span>
              <span>{wake.name}</span>
            </button>
          ))}
        </div>

        {/* Transient Subtitle / Transcript Banner (Zero-Touch / No Clutter) */}
        {liveTranscript && (
          <div className="mt-4 px-4 py-2 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 backdrop-blur-md max-w-md mx-auto text-center animate-fadeIn">
            <span className="text-xs text-cyan-300 font-semibold flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
              <span>"{liveTranscript}"</span>
            </span>
          </div>
        )}

        {/* Spoken Response Feedback Banner (if speaking) */}
        {assistantState === 'SPEAKING' && spokenFeedback && (
          <div className="mt-3 px-4 py-2 rounded-2xl bg-blue-950/40 border border-blue-500/30 backdrop-blur-md max-w-md mx-auto text-center animate-fadeIn">
            <span className="text-xs text-blue-200 font-medium leading-relaxed">
              {spokenFeedback}
            </span>
          </div>
        )}

        {/* AVYAN Profile Link Section (Prompt Requirement #30) */}
        <div className="w-full mt-6">
          <AvyanProfileCard
            onOpenProfile={() => {
              window.open('https://avyan.app/u/bharat.pun.magar', '_blank');
            }}
          />
        </div>
      </main>

      {/* 3. Minimal Bottom Dock Navigation */}
      <BottomControls
        assistantState={assistantState}
        isListening={isListening}
        onToggleMic={handleToggleMic}
        onOpenSettings={() => setShowSettings(true)}
        onOpenMemory={() => setShowMemory(true)}
        onOpenPermissions={() => setShowPermissions(true)}
        onOpenAbout={() => setShowAbout(true)}
        onQuickApp={(appName) => {
          const match = installedApps.find((a) => a.id === appName);
          if (match) setActiveApp(match);
        }}
      />

      {/* 4. Fullscreen Screen Flashlight Overlay */}
      <ScreenFlashlight
        active={telemetry.flashlightOn}
        onToggle={() => {
          setTelemetry((p) => ({ ...p, flashlightOn: false }));
          setHardwareFlashlight(false);
        }}
      />

      {/* 5. Call Confirmation Dialog (Prompt Requirement #17) */}
      <CallConfirmationDialog
        contact={pendingCallContact}
        phoneNumber={pendingCallNumber}
        onConfirm={handleConfirmCall}
        onCancel={() => {
          setPendingCallContact(null);
          setPendingCallNumber('');
        }}
      />

      {/* 6. SMS Composer Dialog */}
      {smsData && (
        <SMSComposerDialog
          recipientName={smsData.recipientName}
          phoneNumber={smsData.phoneNumber}
          initialMessage={smsData.message}
          onSend={(msg) => {
            setSmsData(null);
            respondWithVoice('SMS सफलतापूर्वक पठाइयो।');
          }}
          onClose={() => setSmsData(null)}
        />
      )}

      {/* 7. WhatsApp Composer Dialog */}
      {whatsAppData && (
        <WhatsAppComposerDialog
          recipientName={whatsAppData.recipientName}
          phoneNumber={whatsAppData.phoneNumber}
          initialMessage={whatsAppData.message}
          onSend={(msg) => {
            setWhatsAppData(null);
            respondWithVoice('WhatsApp मेसेज पठाइयो।');
          }}
          onClose={() => setWhatsAppData(null)}
        />
      )}

      {/* 8. Email Composer Dialog */}
      {emailData && (
        <EmailComposerDialog
          recipientEmail={emailData.recipientEmail}
          recipientName={emailData.recipientName}
          initialSubject={emailData.subject}
          initialBody={emailData.body}
          onSend={(subj, body) => {
            setEmailData(null);
            respondWithVoice('इमेल सफलतापूर्वक तयार गरियो।');
          }}
          onClose={() => setEmailData(null)}
        />
      )}

      {/* 9. Active App Simulator Modal */}
      {activeApp && (
        <ActiveAppModal
          app={activeApp}
          initialQuery={appQuery}
          onClose={() => {
            setActiveApp(null);
            setAppQuery('');
          }}
        />
      )}

      {/* 10. Settings & Hardware Modal */}
      {showSettings && (
        <SettingsModal
          telemetry={telemetry}
          onUpdateVolume={(vol) => setTelemetry((p) => ({ ...p, volumeLevel: vol }))}
          onToggleFlashlight={() => {
            const next = !telemetry.flashlightOn;
            setTelemetry((p) => ({ ...p, flashlightOn: next }));
            setHardwareFlashlight(next);
          }}
          onToggleOffline={() => {
            setTelemetry((p) => ({ ...p, isOnline: !p.isOnline }));
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 11. Memory Management Modal */}
      {showMemory && (
        <MemoryModal
          memory={userMemory}
          onSaveMemory={(k, v) => {
            const updated = { ...userMemory, [k]: v };
            setUserMemory(updated);
            saveUserMemory(updated);
          }}
          onClearMemory={() => {
            const cleared = clearAllUserMemory();
            setUserMemory(cleared);
          }}
          onClose={() => setShowMemory(false)}
        />
      )}

      {/* 12. Permissions Modal */}
      {showPermissions && (
        <PermissionsModal
          permissions={permissions}
          onTogglePermission={(key) => {
            setPermissions((p) => ({ ...p, [key]: !p[key] }));
          }}
          onClose={() => setShowPermissions(false)}
        />
      )}

      {/* 13. About BHAPUMA Modal */}
      {showAbout && (
        <AboutModal
          onClose={() => setShowAbout(false)}
          onOpenAvyan={() => {
            window.open('https://avyan.app/u/bharat.pun.magar', '_blank');
          }}
        />
      )}

      {/* 14. Double-Tap Back Exit Toast for Android / Home Screen Protection */}
      {exitToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-zinc-900/95 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-2xl backdrop-blur-lg flex items-center gap-2 animate-fadeIn">
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>एप बन्द गर्न फेरि पछाडि थिच्नुहोस्</span>
        </div>
      )}
    </div>
  );
}
