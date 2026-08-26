import React, { useState } from 'react';
import { Volume2, Copy, Check, Sparkles, User, Bot } from 'lucide-react';
import { speechEngine } from '../utils/speechEngine';

interface ResponseCardProps {
  userQuery: string;
  assistantResponse: string;
  isSpeaking: boolean;
  onClose?: () => void;
}

export const ResponseCard: React.FC<ResponseCardProps> = ({
  userQuery,
  assistantResponse,
  isSpeaking,
}) => {
  const [copied, setCopied] = useState(false);

  if (!userQuery && !assistantResponse) return null;

  const handleCopy = () => {
    if (!assistantResponse) return;
    navigator.clipboard.writeText(assistantResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReplayAudio = () => {
    if (!assistantResponse) return;
    speechEngine.speak(assistantResponse);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 mt-3 mb-2 animate-fadeIn">
      <div className="rounded-3xl bg-gradient-to-b from-zinc-900/95 to-[#090b14]/95 border border-cyan-500/30 p-4 shadow-xl backdrop-blur-2xl">
        {/* User Query */}
        {userQuery && (
          <div className="flex items-start gap-2.5 mb-3 pb-3 border-b border-white/5">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-bold text-zinc-400 block mb-0.5">तपाईंको प्रश्न</span>
              <p className="text-sm font-medium text-white leading-snug">"{userQuery}"</p>
            </div>
          </div>
        )}

        {/* Assistant Response */}
        {assistantResponse && (
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                  <span>भपुमको जवाफ</span>
                  {isSpeaking && (
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleReplayAudio}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-zinc-400 hover:text-cyan-300 transition-all cursor-pointer"
                    title="आवाज सुन्नुहोस् (Play Voice)"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-cyan-400 animate-pulse' : ''}`} />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-zinc-400 hover:text-cyan-300 transition-all cursor-pointer"
                    title="कपी गर्नुहोस् (Copy)"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line font-normal">
                {assistantResponse}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
