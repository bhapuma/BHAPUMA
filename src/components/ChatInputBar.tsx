import React, { useState } from 'react';
import { Send, Sparkles, Mic, CornerDownLeft, MessageSquarePlus } from 'lucide-react';

interface ChatInputBarProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  isListening?: boolean;
  onToggleMic?: () => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSendMessage,
  isLoading,
  disabled = false,
  isListening = false,
  onToggleMic,
}) => {
  const [inputText, setInputText] = useState('');

  const quickPrompts = [
    { label: '🇳🇵 नेपालको राजधानी?', query: 'नेपालको राजधानी कहाँ हो?' },
    { label: '😄 चुट्किला सुनाउ', query: 'एउटा रमाइलो चुट्किला सुनाउ' },
    { label: '🔋 ब्याट्री कति छ?', query: 'ब्याट्री कति छ?' },
    { label: '🔦 टर्च बाल', query: 'टर्च बाल' },
    { label: '👤 भरत पुन मगर को हुन्?', query: 'भरत पुन मगर को हुन्?' },
    { label: '⏰ कति बज्यो?', query: 'अहिले कति बज्यो?' },
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputText.trim();
    if (!clean || isLoading || disabled) return;
    onSendMessage(clean);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 mt-2 mb-3">
      {/* Quick Suggestion Chips (Horizontal Scroll) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSendMessage(p.query)}
            disabled={isLoading || disabled}
            className="flex-shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-cyan-500/20 active:bg-cyan-500/30 border border-white/10 hover:border-cyan-400/40 text-[11px] font-medium text-zinc-300 hover:text-cyan-300 transition-all cursor-pointer whitespace-nowrap shadow-sm"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main Text Input Box */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center rounded-2xl bg-zinc-900/90 border border-cyan-500/30 shadow-lg shadow-cyan-950/30 backdrop-blur-xl focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all p-1.5"
      >
        <div className="pl-2.5 text-cyan-400 flex items-center justify-center">
          <MessageSquarePlus className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="यहाँ सोध्नुहोस् वा टाइप गर्नुहोस्..."
          disabled={disabled || isLoading}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none"
        />

        {inputText.trim() ? (
          <button
            type="submit"
            disabled={isLoading || disabled}
            className="p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold shadow-md shadow-cyan-500/30 hover:scale-105 active:scale-95"
            title="पठाउनुहोस् (Send Query)"
          >
            {isLoading ? (
              <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleMic}
            disabled={isLoading || disabled}
            className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40 scale-105'
                : 'bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black shadow-sm shadow-cyan-500/20'
            }`}
            title={isListening ? 'सुन्दैछ... (Listening)' : 'बोलेर सोध्नुहोस् (Voice Chat)'}
          >
            <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce' : ''}`} />
          </button>
        )}
      </form>
    </div>
  );
};
