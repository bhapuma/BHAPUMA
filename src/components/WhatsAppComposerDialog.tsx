import React, { useState } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';

interface WhatsAppComposerDialogProps {
  recipientName: string;
  phoneNumber: string;
  initialMessage?: string;
  onSend: (message: string) => void;
  onClose: () => void;
}

export const WhatsAppComposerDialog: React.FC<WhatsAppComposerDialogProps> = ({
  recipientName,
  phoneNumber,
  initialMessage = '',
  onSend,
  onClose,
}) => {
  const [message, setMessage] = useState(initialMessage);

  const handleSend = () => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    onSend(message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-[#0b0c12] border border-emerald-500/30 p-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <MessageCircle className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">WhatsApp सन्देश (Compose)</h2>
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
          <label className="text-xs text-zinc-400 font-medium block mb-1">WhatsApp Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="WhatsApp मा पठाउने सन्देश..."
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-400 outline-none text-white text-sm resize-none"
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
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>WhatsApp खोल्नुहोस्</span>
          </button>
        </div>
      </div>
    </div>
  );
};
