import React from 'react';
import {
  Mic,
  MicOff,
  Sliders,
  Brain,
  ShieldCheck,
  Smartphone,
  Info,
  Youtube,
  Radio,
} from 'lucide-react';
import { AssistantState } from '../types';

interface BottomControlsProps {
  assistantState: AssistantState;
  isListening: boolean;
  onToggleMic: () => void;
  onOpenSettings: () => void;
  onOpenMemory: () => void;
  onOpenPermissions: () => void;
  onOpenAbout: () => void;
  onQuickApp?: (appName: string) => void;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  assistantState,
  isListening,
  onToggleMic,
  onOpenSettings,
  onOpenMemory,
  onOpenPermissions,
  onOpenAbout,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto px-4 pb-4 select-none relative z-20">
      {/* Minimal Floating Dock */}
      <div className="p-2 rounded-3xl bg-[#08090f]/90 border border-white/10 backdrop-blur-xl shadow-2xl flex items-center justify-around">
        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-3 rounded-2xl text-zinc-400 hover:text-cyan-300 hover:bg-white/5 active:scale-95 transition-all flex flex-col items-center gap-1"
          title="Settings & Volume"
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[10px] font-medium">सेटिङ्स</span>
        </button>

        {/* Memory */}
        <button
          onClick={onOpenMemory}
          className="p-3 rounded-2xl text-zinc-400 hover:text-cyan-300 hover:bg-white/5 active:scale-95 transition-all flex flex-col items-center gap-1"
          title="Memory Manager"
        >
          <Brain className="w-5 h-5" />
          <span className="text-[10px] font-medium">मेमोरी</span>
        </button>

        {/* Primary Mic Trigger Button (Large Glowing Core) */}
        <button
          onClick={onToggleMic}
          className={`relative p-4 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 ${
            isListening
              ? 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(6,182,212,0.7)] animate-pulse scale-105'
              : 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_28px_rgba(6,182,212,0.55)]'
          }`}
          title={isListening ? 'Stop Listening' : 'Start BHAPUMA Assistant'}
        >
          {isListening ? (
            <Mic className="w-6 h-6 animate-bounce" />
          ) : (
            <MicOff className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Permissions */}
        <button
          onClick={onOpenPermissions}
          className="p-3 rounded-2xl text-zinc-400 hover:text-cyan-300 hover:bg-white/5 active:scale-95 transition-all flex flex-col items-center gap-1"
          title="Permissions Onboarding"
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] font-medium">अनुमति</span>
        </button>

        {/* About Profile */}
        <button
          onClick={onOpenAbout}
          className="p-3 rounded-2xl text-zinc-400 hover:text-cyan-300 hover:bg-white/5 active:scale-95 transition-all flex flex-col items-center gap-1"
          title="About BHAPUMA Assistant"
        >
          <Info className="w-5 h-5" />
          <span className="text-[10px] font-medium">बारे</span>
        </button>
      </div>
    </div>
  );
};
