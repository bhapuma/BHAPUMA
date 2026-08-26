import React from 'react';
import { ExternalLink, UserCheck, Sparkles } from 'lucide-react';

const AVYAN_PROFILE_AVATAR_URL = 'https://i.postimg.cc/ry98qSYd/file-0000000039f48208a70f87b0d1d2e71c.png';

interface AvyanProfileCardProps {
  onOpenProfile: () => void;
}

export const AvyanProfileCard: React.FC<AvyanProfileCardProps> = ({ onOpenProfile }) => {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 select-none">
      <div 
        onClick={onOpenProfile}
        className="relative group overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/40 via-zinc-900/90 to-indigo-950/40 border border-cyan-500/25 p-3.5 flex items-center justify-between shadow-lg hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all cursor-pointer active:scale-[0.98]"
        title="Open Bharat Pun Magar's AVYAN Profile"
      >
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1.5px] shadow-md flex items-center justify-center">
            <img
              src={AVYAN_PROFILE_AVATAR_URL}
              alt="Bharat Pun Magar"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                Bharat Pun Magar — AVYAN Profile
              </h3>
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">
              avyan.app/u/bharat.pun.magar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold group-hover:bg-cyan-500 group-hover:text-black transition-all">
          <span>खोलुस्</span>
          <ExternalLink className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};
