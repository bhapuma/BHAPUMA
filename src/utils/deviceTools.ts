import { ContactItem, InstalledApp, UserMemory } from '../types';
import { getNaturalNepaliDate, getNaturalNepaliTime } from './nepaliTime';

// Default installed applications for Android simulation & real URL intents
export const DEFAULT_INSTALLED_APPS: InstalledApp[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    nameNepali: 'युट्युब',
    packageName: 'com.google.android.youtube',
    iconName: 'Youtube',
    category: 'media',
    webUrl: 'https://www.youtube.com',
    color: '#FF0000',
  },
  {
    id: 'chrome',
    name: 'Google Chrome',
    nameNepali: 'क्रोम ब्राउजर',
    packageName: 'com.android.chrome',
    iconName: 'Globe',
    category: 'tools',
    webUrl: 'https://www.google.com',
    color: '#4285F4',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    nameNepali: 'ह्वाट्सएप',
    packageName: 'com.whatsapp',
    iconName: 'MessageSquare',
    category: 'communication',
    webUrl: 'https://web.whatsapp.com',
    color: '#25D366',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    nameNepali: 'फेसबुक',
    packageName: 'com.facebook.katana',
    iconName: 'Share2',
    category: 'social',
    webUrl: 'https://www.facebook.com',
    color: '#1877F2',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    nameNepali: 'इन्स्टाग्राम',
    packageName: 'com.instagram.android',
    iconName: 'Camera',
    category: 'social',
    webUrl: 'https://www.instagram.com',
    color: '#E4405F',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    nameNepali: 'टिकटक',
    packageName: 'com.zhiliaoapp.musically',
    iconName: 'Video',
    category: 'social',
    webUrl: 'https://www.tiktok.com',
    color: '#FE2C55',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    nameNepali: 'जिमेल',
    packageName: 'com.google.android.gm',
    iconName: 'Mail',
    category: 'communication',
    webUrl: 'https://mail.google.com',
    color: '#EA4335',
  },
  {
    id: 'maps',
    name: 'Google Maps',
    nameNepali: 'गुगल म्याप्स',
    packageName: 'com.google.android.apps.maps',
    iconName: 'MapPin',
    category: 'tools',
    webUrl: 'https://maps.google.com',
    color: '#34A853',
  },
  {
    id: 'calculator',
    name: 'Calculator',
    nameNepali: 'क्यालकुलेटर',
    packageName: 'com.google.android.calculator',
    iconName: 'Calculator',
    category: 'tools',
    color: '#FBBC05',
  },
  {
    id: 'camera',
    name: 'Camera',
    nameNepali: 'क्यामेरा',
    packageName: 'com.android.camera',
    iconName: 'Camera',
    category: 'media',
    color: '#9C27B0',
  },
  {
    id: 'photos',
    name: 'Gallery / Photos',
    nameNepali: 'ग्यालरी / फोटो',
    packageName: 'com.google.android.apps.photos',
    iconName: 'Image',
    category: 'media',
    webUrl: 'https://photos.google.com',
    color: '#FF6D00',
  },
  {
    id: 'settings',
    name: 'Settings',
    nameNepali: 'सेटिङ्स',
    packageName: 'com.android.settings',
    iconName: 'Settings',
    category: 'system',
    color: '#607D8B',
  },
  {
    id: 'files',
    name: 'Files',
    nameNepali: 'फाइल म्यानेजर',
    packageName: 'com.google.android.apps.nbu.files',
    iconName: 'Folder',
    category: 'tools',
    color: '#00ACC1',
  },
  {
    id: 'playstore',
    name: 'Google Play Store',
    nameNepali: 'प्ले स्टोर',
    packageName: 'com.android.vending',
    iconName: 'ShoppingBag',
    category: 'tools',
    webUrl: 'https://play.google.com',
    color: '#00E676',
  },
  {
    id: 'music',
    name: 'Music Player',
    nameNepali: 'म्युजिक',
    packageName: 'com.google.android.apps.youtube.music',
    iconName: 'Music',
    category: 'media',
    webUrl: 'https://music.youtube.com',
    color: '#FF1744',
  },
];

// Stored Contacts for address book resolution
export const DEFAULT_CONTACTS: ContactItem[] = [
  {
    id: '1',
    name: 'Ram Shrestha',
    nameNepali: 'राम श्रेष्ठ',
    phoneNumber: '+977 9841234567',
    email: 'ram.shrestha@example.com',
    avatarColor: '#3B82F6',
    favorite: true,
  },
  {
    id: '2',
    name: 'Sita Sharma',
    nameNepali: 'सीता शर्मा',
    phoneNumber: '+977 9851122334',
    email: 'sita.sharma@example.com',
    avatarColor: '#EC4899',
    favorite: true,
  },
  {
    id: '3',
    name: 'Hari Gurung',
    nameNepali: 'हरि गुरुङ',
    phoneNumber: '+977 9801987654',
    email: 'hari.gurung@example.com',
    avatarColor: '#10B981',
  },
  {
    id: '4',
    name: 'Bharat Pun Magar',
    nameNepali: 'भरत पुन मगर',
    phoneNumber: '+977 9704227689',
    email: 'bhapuma.official@gmail.com',
    avatarColor: '#8B5CF6',
    favorite: true,
  },
  {
    id: '5',
    name: 'Aayush KC',
    nameNepali: 'आयुष केसी',
    phoneNumber: '+977 9812345678',
    email: 'aayush.kc@example.com',
    avatarColor: '#F59E0B',
  },
  {
    id: '6',
    name: 'Pooja Thapa',
    nameNepali: 'पूजा थापा',
    phoneNumber: '+977 9849871234',
    email: 'pooja.thapa@example.com',
    avatarColor: '#06B6D4',
  },
];

// Local Memory Key
const MEMORY_STORAGE_KEY = 'bhapuma_user_memory_v1';

export function loadUserMemory(): UserMemory {
  try {
    const saved = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return {
    userName: 'Bharat Pun Magar (BHAPUMA)',
    nickname: 'Bharat',
    phoneNumber: '+977 9704227689',
    email: 'bhapuma.official@gmail.com',
    favoriteMusic: 'Nepali Folk & Lo-Fi Beats',
    homeCity: 'Kathmandu, Nepal',
  };
}

export function saveUserMemory(memory: UserMemory) {
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memory));
  } catch (e) {}
}

export function clearAllUserMemory(): UserMemory {
  try {
    localStorage.removeItem(MEMORY_STORAGE_KEY);
  } catch (e) {}
  return {};
}

// Torch / Flashlight hardware controller
let torchStream: MediaStream | null = null;
let torchTrack: MediaStreamTrack | null = null;

export async function setHardwareFlashlight(enable: boolean): Promise<boolean> {
  try {
    if (enable) {
      if (!torchTrack && navigator.mediaDevices?.getUserMedia) {
        torchStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            advanced: [{ torch: true } as any],
          } as any,
        });
        torchTrack = torchStream.getVideoTracks()[0];
      }
      if (torchTrack) {
        await (torchTrack as any).applyConstraints({
          advanced: [{ torch: true }],
        });
        return true;
      }
    } else {
      if (torchTrack) {
        await (torchTrack as any).applyConstraints({
          advanced: [{ torch: false }],
        });
        torchTrack.stop();
        torchTrack = null;
      }
      if (torchStream) {
        torchStream.getTracks().forEach((t) => t.stop());
        torchStream = null;
      }
      return false;
    }
  } catch (err) {
    console.warn('Hardware torch error (will fallback to screen torch):', err);
  }
  return false;
}

// Battery Telemetry
export async function getRealBatteryInfo(): Promise<{
  level: number;
  charging: boolean;
  dischargingTime?: number;
}> {
  try {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      const battery: any = await (navigator as any).getBattery();
      return {
        level: Math.round(battery.level * 100),
        charging: battery.charging,
        dischargingTime: battery.dischargingTime,
      };
    }
  } catch (e) {}
  return {
    level: 84,
    charging: false,
  };
}

// Local Offline Command Parser
export function parseLocalOfflineCommand(
  text: string,
  state: {
    batteryLevel: number;
    isCharging: boolean;
    volumeLevel: number;
    flashlightOn: boolean;
    contacts: ContactItem[];
    installedApps: InstalledApp[];
    memory: UserMemory;
  }
): {
  handled: boolean;
  nepaliResponse: string;
  action?: string;
  payload?: any;
} {
  const lower = text.toLowerCase().trim();

  // 1. Direct Wake Word & Name Calls (भरत, भपुम, ह्याकर, कम्प्युटर)
  // Check if input is a greeting or direct name call
  const isDirectCall =
    lower.length < 30 &&
    (lower.startsWith('हे ') ||
      lower.startsWith('सुन ') ||
      lower.startsWith('ओई ') ||
      lower.startsWith('नमस्ते ') ||
      lower.startsWith('hey ') ||
      lower === 'भरत' ||
      lower === 'भपुम' ||
      lower === 'भपुमा' ||
      lower === 'ह्याकर' ||
      lower === 'कम्प्युटर' ||
      lower === 'bharat' ||
      lower === 'bhapuma' ||
      lower === 'hacker' ||
      lower === 'computer' ||
      lower.includes('सुन त') ||
      lower.includes('के छ') ||
      lower.includes('कस्तो छ'));

  if (isDirectCall) {
    return {
      handled: true,
      nepaliResponse: 'हजुर, भन्नुहोस्! म सुन्दैछु, के सहयोग गरूँ?',
      action: 'wake_assistant',
    };
  }

  // Battery status
  if (lower.includes('battery') || lower.includes('ब्याट्री') || lower.includes('चार्ज') || lower.includes('charge')) {
    const status = state.isCharging ? 'चार्ज भइरहेको छ' : 'डिस्चार्ज अवस्थामा छ';
    return {
      handled: true,
      nepaliResponse: `तपाईंको फोनको ब्याट्री ${state.batteryLevel}% छ र यो ${status}।`,
      action: 'battery_checked',
    };
  }

  // Time
  if (lower.includes('time') || lower.includes('समय') || lower.includes('बज्यो') || lower.includes('कति बज्यो')) {
    const timeInfo = getNaturalNepaliTime();
    return {
      handled: true,
      nepaliResponse: timeInfo.spokenText,
      action: 'time_checked',
    };
  }

  // Date
  if (lower.includes('date') || lower.includes('मिति') || lower.includes('बार') || lower.includes('गते')) {
    const dateInfo = getNaturalNepaliDate();
    return {
      handled: true,
      nepaliResponse: dateInfo.spokenText,
      action: 'date_checked',
    };
  }

  // Flashlight on
  if (
    lower.includes('flashlight on') ||
    lower.includes('torch on') ||
    lower.includes('टर्च बाल्') ||
    lower.includes('फ्ल्यासलाइट अन') ||
    lower.includes('बत्ती बाल')
  ) {
    return {
      handled: true,
      nepaliResponse: 'फ्ल्यासलाइट बालेको छु।',
      action: 'flashlight_on',
    };
  }

  // Flashlight off
  if (
    lower.includes('flashlight off') ||
    lower.includes('torch off') ||
    lower.includes('टर्च निभा') ||
    lower.includes('फ्ल्यासलाइट अफ') ||
    lower.includes('बत्ती निभा')
  ) {
    return {
      handled: true,
      nepaliResponse: 'फ्ल्यासलाइट बन्द गरेको छु।',
      action: 'flashlight_off',
    };
  }

  // Volume
  if (lower.includes('volume') || lower.includes('आवाज') || lower.includes('भोल्युम')) {
    if (lower.includes('बढा') || lower.includes('up') || lower.includes('increase') || lower.includes('high')) {
      return {
        handled: true,
        nepaliResponse: 'भोल्युम बढाएको छु।',
        action: 'volume_increase',
      };
    }
    if (lower.includes('घटा') || lower.includes('down') || lower.includes('decrease') || lower.includes('low')) {
      return {
        handled: true,
        nepaliResponse: 'भोल्युम घटाएको छु।',
        action: 'volume_decrease',
      };
    }
    if (lower.includes('max') || lower.includes('maximum') || lower.includes('फुल')) {
      return {
        handled: true,
        nepaliResponse: 'भोल्युम १००% म्याक्सिमम बनाएको छु।',
        action: 'volume_max',
      };
    }
    if (lower.includes('min') || lower.includes('mute') || lower.includes('शून्य') || lower.includes('कम')) {
      return {
        handled: true,
        nepaliResponse: 'भोल्युम म्युट गरेको छु।',
        action: 'volume_min',
      };
    }
    return {
      handled: true,
      nepaliResponse: `हालको मिडिया भोल्युम ${state.volumeLevel}% छ।`,
      action: 'volume_status',
    };
  }

  // Media
  if (lower.includes('pause') || lower.includes('रोक्') || lower.includes('बन्द गर')) {
    return {
      handled: true,
      nepaliResponse: 'म्युजिक पज गरिएको छ।',
      action: 'media_pause',
    };
  }
  if (lower.includes('play') || lower.includes('बजाऊ') || lower.includes('सुरु गर')) {
    return {
      handled: true,
      nepaliResponse: 'म्युजिक बजाइएको छ।',
      action: 'media_play',
    };
  }

  // Avyan Profile
  if (lower.includes('avyan') || lower.includes('profile') || lower.includes('भरत पुन') || lower.includes('bharat')) {
    return {
      handled: true,
      nepaliResponse: 'भरत पुन मगरको AVYAN Profile खोल्दैछु।',
      action: 'open_avyan',
    };
  }

  // App opening
  for (const app of state.installedApps) {
    if (
      lower.includes(app.name.toLowerCase()) ||
      lower.includes(app.nameNepali.toLowerCase()) ||
      lower.includes(app.id)
    ) {
      return {
        handled: true,
        nepaliResponse: `${app.name} एप खोल्दैछु।`,
        action: 'open_app',
        payload: app,
      };
    }
  }

  // Settings
  if (lower.includes('setting') || lower.includes('सेटिङ')) {
    return {
      handled: true,
      nepaliResponse: 'एन्ड्रोइड सेटिङ्स खोल्दैछु।',
      action: 'open_settings',
    };
  }

  // Stored Name query
  if (lower.includes('मेरो नाम') || lower.includes('who am i') || lower.includes('my name')) {
    const userName = state.memory.userName || state.memory.nickname || 'Bharat Pun Magar';
    return {
      handled: true,
      nepaliResponse: `तपाईंको नाम ${userName} हो।`,
      action: 'memory_read',
    };
  }

  // Default fallback if offline and not local command
  return {
    handled: false,
    nepaliResponse: 'यो काम गर्न इन्टरनेट चाहिन्छ।',
  };
}
