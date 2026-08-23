import React, { useState } from 'react';
import { Send, X, MessageSquare, Phone } from 'lucide-react';

interface SMSComposerDialogProps {
  recipientName: string;
  phoneNumber: string;
  initialMessage?: string;
  onSend: (message: string) => void;
  onClose: () => void;
}

export const SMSComposerDialog: React.FC<SMSComposerDialogProps> = ({
  recipientName,
  phoneNumber,
  initialMessage = '',
  onSend,
  onClose,
}) => {
  const [message, setMessage] = useState(initialMessage);

  const handleSend = () => {
    // Open native Android SMS intent
    const cleanNumber = phoneNumber.replace(/\s+/g, '');
    window.open(`sms:${cleanNumber}?body=${encodeURIComponent(message)}`, '_blank');
    onSend(message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-[#0b0c12] border border-cyan-500/30 p-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <MessageSquare className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">SMS लेख्नुहोस् (Compose SMS)</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-3">
          <label className="text-xs text-zinc-400 font-medium block mb-1">प्राप्तकर्ता (To):</label>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white">
            {recipientName} ({phoneNumber})
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs text-zinc-400 font-medium block mb-1">सन्देश (Message):</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="यहाँ आफ्नो सन्देश लेख्नुहोस्..."
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 outline-none text-white text-sm resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-sm font-semibold"
          >
            बन्द गर
          </button>
          <button
            onClick={handleSend}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-bold text-sm shadow-md flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>SMS पठाउनुहोस्</span>
          </button>
        </div>
      </div>
    </div>
  );
};
