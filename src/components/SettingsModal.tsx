import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Flashlight,
  Sliders,
  User,
  Volume1,
} from 'lucide-react';
import { DeviceTelemetry } from '../types';
import { speechEngine, VoiceSettings } from '../utils/speechEngine';

interface SettingsModalProps {
  telemetry: DeviceTelemetry;
  onUpdateVolume: (level: number) => void;
  onToggleFlashlight: () => void;
  onToggleOffline: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  telemetry,
  onUpdateVolume,
  onToggleFlashlight,
  onToggleOffline,
  onClose,
}) => {
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(speechEngine.getVoiceSettings());

  const handlePitchChange = (pitch: number) => {
    const updated = { ...voiceSettings, pitch };
    setVoiceSettings(updated);
    speechEngine.updateVoiceSettings({ pitch });
  };

  const handleRateChange = (rate: number) => {
    const updated = { ...voiceSettings, rate };
    setVoiceSettings(updated);
    speechEngine.updateVoiceSettings({ rate });
  };

  const selectMaleVoicePreset = (pitch: number, rate: number, style: 'teen_boy' | 'energetic_male' | 'deep_male') => {
    const updated = { ...voiceSettings, pitch, rate, voiceStyle: style };
    setVoiceSettings(updated);
    speechEngine.updateVoiceSettings(updated);
    speechEngine.speak('नमस्ते! म भपुम, तपाईंको स्मार्ट असिस्टेन्ट तयार छु!');
  };

  const testTeenagerVoice = () => {
    speechEngine.speak('नमस्ते भरत! म भपुम, तपाईंको स्मार्ट एआई असिस्टेन्ट। म सुन्दैछु, आज्ञा गर्नुहोस्!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md rounded-3xl bg-[#090a10] border border-cyan-500/30 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sliders className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">BHAPUMA सेटिङ (Settings)</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Teenager Boy Voice Settings Section */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
                <User className="w-4 h-4 text-cyan-400" />
                <span>१७ वर्षे केटाको आवाज (100% Male Voice)</span>
              </div>
              <button
                onClick={testTeenagerVoice}
                className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-1 shadow-md shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <Volume1 className="w-3.5 h-3.5" />
                <span>आवाज टेस्ट</span>
              </button>
            </div>

            {/* Male Voice Quick Presets */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={() => selectMaleVoicePreset(0.90, 1.02, 'teen_boy')}
                className={`px-2 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                  voiceSettings.voiceStyle === 'teen_boy'
                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                १७ वर्षे केटो
              </button>
              <button
                type="button"
                onClick={() => selectMaleVoicePreset(0.96, 1.08, 'energetic_male')}
                className={`px-2 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                  voiceSettings.voiceStyle === 'energetic_male'
                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                ऊर्जावान केटो
              </button>
              <button
                type="button"
                onClick={() => selectMaleVoicePreset(0.82, 0.98, 'deep_male')}
                className={`px-2 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                  voiceSettings.voiceStyle === 'deep_male'
                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                गम्भीर आवाज
              </button>
            </div>

            {/* Pitch Controller (Strictly calibrated for male voice spectrum) */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-zinc-300 mb-1.5">
                <span>आवाजको बेस / पिच (Male Pitch)</span>
                <span className="font-mono text-cyan-400 font-bold">{voiceSettings.pitch.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.05"
                step="0.02"
                value={voiceSettings.pitch}
                onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Speaking Rate / Speed */}
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-300 mb-1.5">
                <span>बोल्ने गति (Speaking Speed)</span>
                <span className="font-mono text-cyan-400 font-bold">{voiceSettings.rate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.85"
                max="1.25"
                step="0.03"
                value={voiceSettings.rate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Media Volume Slider */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                {telemetry.volumeLevel === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                )}
                <span>मिडिया भोल्युम (Media Volume)</span>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {telemetry.volumeLevel}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={telemetry.volumeLevel}
              onChange={(e) => onUpdateVolume(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Flashlight Quick Control */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Flashlight className={`w-5 h-5 ${telemetry.flashlightOn ? 'text-amber-400' : 'text-zinc-500'}`} />
              <div>
                <div className="text-sm font-semibold text-white">फ्ल्यासलाइट / टर्च (Torch)</div>
                <div className="text-xs text-zinc-400">
                  {telemetry.flashlightOn ? 'चालु छ (ON)' : 'बन्द छ (OFF)'}
                </div>
              </div>
            </div>
            <button
              onClick={onToggleFlashlight}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                telemetry.flashlightOn
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-white/10 text-zinc-300 hover:bg-white/15'
              }`}
            >
              {telemetry.flashlightOn ? 'बन्द गर' : 'चालु गर'}
            </button>
          </div>

          {/* Offline / Online Mode */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {telemetry.isOnline ? (
                <Wifi className="w-5 h-5 text-emerald-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-amber-400" />
              )}
              <div>
                <div className="text-sm font-semibold text-white">नेटवर्क स्थिति (Network Mode)</div>
                <div className="text-xs text-zinc-400">
                  {telemetry.isOnline ? 'Online (Gemini Flash Mode)' : 'Offline (Local Commands Mode)'}
                </div>
              </div>
            </div>
            <button
              onClick={onToggleOffline}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                telemetry.isOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/20'
              }`}
            >
              {telemetry.isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all"
        >
          बन्द गर्नुहोस्
        </button>
      </div>
    </div>
  );
};
