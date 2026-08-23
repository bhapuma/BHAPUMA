import React, { useState } from 'react';
import { Send, X, Mail } from 'lucide-react';

interface EmailComposerDialogProps {
  recipientEmail: string;
  recipientName: string;
  initialSubject?: string;
  initialBody?: string;
  onSend: (subject: string, body: string) => void;
  onClose: () => void;
}

export const EmailComposerDialog: React.FC<EmailComposerDialogProps> = ({
  recipientEmail,
  recipientName,
  initialSubject = '',
  initialBody = '',
  onSend,
  onClose,
}) => {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);

  const handleSend = () => {
    const mailto = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
    onSend(subject, body);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-[#0b0c12] border border-rose-500/30 p-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2 text-rose-400">
            <Mail className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">Gmail / Email लेख्नुहोस्</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-2.5">
          <label className="text-xs text-zinc-400 font-medium block mb-1">To:</label>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white">
            {recipientName} ({recipientEmail || 'No email specified'})
          </div>
        </div>

        <div className="mb-2.5">
          <label className="text-xs text-zinc-400 font-medium block mb-1">Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="विषय (Subject)..."
            className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-rose-400 outline-none text-white text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="text-xs text-zinc-400 font-medium block mb-1">Body:</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="इमेलको विवरण..."
            className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-rose-400 outline-none text-white text-sm resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-sm font-semibold"
          >
            रद्द गर
          </button>
          <button
            onClick={handleSend}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>इमेल पठाउनुहोस्</span>
          </button>
        </div>
      </div>
    </div>
  );
};
