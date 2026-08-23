import React from 'react';
import { Flashlight, Power, Sun } from 'lucide-react';

interface ScreenFlashlightProps {
  active: boolean;
  onToggle: () => void;
}

export const ScreenFlashlight: React.FC<ScreenFlashlightProps> = ({ active, onToggle }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white text-black flex flex-col items-center justify-between p-8 select-none animate-fadeIn">
      <div className="flex items-center gap-2 pt-4">
        <Sun className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xl font-extrabold tracking-wider">FLASHLIGHT / TORCH ACTIVE</span>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="w-28 h-28 rounded-full bg-amber-400/30 border-4 border-black flex items-center justify-center mb-6 shadow-2xl animate-pulse">
          <Flashlight className="w-14 h-14 text-black" />
        </div>
        <p className="text-base font-bold mb-1">
          BHAPUMA फ्ल्यासलाइट सक्रिय छ
        </p>
        <p className="text-xs text-neutral-600 max-w-xs">
          High-intensity screen torch / Camera hardware flash beam mode.
        </p>
      </div>

      <button
        onClick={onToggle}
        className="w-full max-w-xs py-4 px-6 rounded-2xl bg-black text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-2xl hover:bg-neutral-800 transition-all active:scale-95"
      >
        <Power className="w-5 h-5 text-rose-400" />
        <span>फ्ल्यासलाइट बन्द गर्नुहोस् (Turn Off)</span>
      </button>
    </div>
  );
};
