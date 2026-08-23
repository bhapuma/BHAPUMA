import React from 'react';
import { Phone, PhoneOff, User, ShieldAlert } from 'lucide-react';
import { ContactItem } from '../types';

interface CallConfirmationDialogProps {
  contact: ContactItem | null;
  phoneNumber?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CallConfirmationDialog: React.FC<CallConfirmationDialogProps> = ({
  contact,
  phoneNumber,
  onConfirm,
  onCancel,
}) => {
  if (!contact && !phoneNumber) return null;

  const displayName = contact ? contact.nameNepali || contact.name : 'Unknown Contact';
  const targetNumber = phoneNumber || contact?.phoneNumber || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-[#0b0c12] border border-cyan-500/30 p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl" />

        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/10">
          <Phone className="w-8 h-8 animate-pulse" />
        </div>

        {/* Title / Question in Nepali */}
        <h2 className="text-xl font-bold text-white mb-1 font-['Mukta',sans-serif]">
          कल पुष्टि (Call Confirmation)
        </h2>
        <p className="text-sm text-cyan-300 font-semibold mb-4 font-['Mukta',sans-serif]">
          {displayName} लाई call गर्न लाग्दैछु। Call गरौँ?
        </p>

        {/* Contact Info Card */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 mb-6 flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-cyan-600/30 text-cyan-300 flex items-center justify-center font-bold">
            {displayName.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{displayName}</div>
            <div className="text-xs text-zinc-400 font-mono">{targetNumber}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-semibold text-sm transition-all flex items-center justify-center gap-1.5"
          >
            <PhoneOff className="w-4 h-4 text-rose-400" />
            <span>रद्द गर</span>
          </button>

          <button
            onClick={onConfirm}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Phone className="w-4 h-4 text-black" />
            <span>हो (Call गर)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
