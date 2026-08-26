import React, { useState } from 'react';
import { WifiOff, X, Zap, Flashlight, Battery, Clock, Calculator, MapPin, Mountain, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface OfflineCommandsCardProps {
  isOnline: boolean;
  onExecuteCommand: (cmd: string) => void;
}

export const OfflineCommandsCard: React.FC<OfflineCommandsCardProps> = ({
  isOnline,
  onExecuteCommand,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // If online or manually dismissed, do not render
  if (isOnline || isDismissed) {
    return null;
  }

  const offlineCommands = [
    { label: '🔦 टर्च बाल / निभाउ', query: 'टर्च बाल', icon: Flashlight },
    { label: '🔋 ब्याट्री कति छ?', query: 'ब्याट्री कति छ?', icon: Battery },
    { label: '⏰ अहिले कति बज्यो?', query: 'अहिले कति बज्यो?', icon: Clock },
    { label: '🧮 ५० × २० कति हुन्छ?', query: '५० * २० कति हुन्छ?', icon: Calculator },
    { label: '🇳🇵 नेपालका ७ प्रदेश', query: 'नेपालका प्रदेशहरू', icon: MapPin },
    { label: '🏔️ नेपालका हिमालहरू', query: 'नेपालका हिमालहरू', icon: Mountain },
    { label: '👤 भरत पुन मगर परिचय', query: 'भरत पुन मगर को हुन्?', icon: Sparkles },
  ];

  return (
    <div className="w-full max-w-lg mx-auto my-2 px-3 animate-fadeIn">
      <div className="relative rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900/90 to-amber-950/30 border border-amber-500/40 p-3.5 shadow-xl backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span>अफलाइन मोड (Offline Mode)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  सक्रिय
                </span>
              </h4>
              <p className="text-[11px] text-zinc-400">
                इन्टरनेट बिना पनि चल्ने उपलब्ध कमान्डहरू:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
              title={isExpanded ? 'कम देखाउनुहोस्' : 'धेरै देखाउनुहोस्'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="हटाउनुहोस्"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List of Offline Quick Commands */}
        {isExpanded && (
          <div className="mt-2.5 flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
            {offlineCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onExecuteCommand(cmd.query)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-800/80 hover:bg-amber-950/60 border border-zinc-700/60 hover:border-amber-500/50 text-[11px] text-zinc-200 hover:text-amber-200 transition-all active:scale-95 touch-manipulation shadow-sm"
                >
                  <Icon className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{cmd.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
