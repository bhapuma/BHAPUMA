import React from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Flashlight,
  Radio,
  Sparkles,
  Shield,
  Sliders,
} from 'lucide-react';
import { DeviceTelemetry } from '../types';

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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md rounded-3xl bg-[#090a10] border border-cyan-500/30 p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sliders className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">BHAPUMA यन्त्र नियन्त्रण (Settings)</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
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

          {/* Offline / Online Mode Simulation */}
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
                  {telemetry.isOnline ? 'Online (Gemini Live Mode)' : 'Offline (Local Commands Mode)'}
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

          {/* Assistant Info Banner */}
          <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-xs text-cyan-200/90 leading-relaxed">
              BHAPUMA ले आवाज पहिचान गर्न र उपकरणका कार्यहरू (कल, एप, भोल्युम, टर्च) स्वचालित रूपमा कार्यान्वयन गर्न वास्तविक एन्ड्रोइड इन्टेन्ट्स प्रयोग गर्छ।
            </p>
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
