import React from 'react';
import { X, Sparkles, ExternalLink, ShieldCheck, Heart, User, CheckCircle } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
  onOpenAvyan: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose, onOpenAvyan }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md rounded-3xl bg-[#090a10] border border-cyan-500/30 p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">BHAPUMA Assistant बारे (About)</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-gradient-to-b from-cyan-950/30 to-black border border-cyan-500/20 mb-4">
          <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-indigo-500 to-amber-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] mb-3">
            <img
              src="https://i.postimg.cc/c42MLcWn/file-00000000d6ec8211b521596daf8be65d.png"
              alt="Bharat Pun Magar (BHAPUMA)"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h3 className="text-xl font-extrabold font-['Orbitron',sans-serif] text-white">
            BHAPUMA
          </h3>
          <p className="text-sm text-cyan-300 font-semibold mb-1">Bharat Pun Magar</p>
          <span className="text-xs text-zinc-400">
            17-Year-Old Advanced Android AI Voice Assistant (भपुम)
          </span>

          <button
            onClick={onOpenAvyan}
            className="mt-3.5 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <span>Bharat Pun Magar — AVYAN Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Official Contact Info Card */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 mb-4 space-y-2.5">
          <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>आधिकारिक सम्पर्क (Official Contact)</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
            <span className="text-zinc-400">Phone:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-white font-semibold">+977 9704227689</span>
              <a
                href="tel:9704227689"
                className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-[11px] font-bold"
              >
                Call
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-zinc-400">Email:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-white font-semibold truncate max-w-[160px]">bhapuma.official@gmail.com</span>
              <a
                href="mailto:bhapuma.official@gmail.com"
                className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[11px] font-bold"
              >
                Mail
              </a>
            </div>
          </div>
        </div>

        {/* Assistant Personality & Guardrails */}
        <div className="space-y-2.5 text-xs text-zinc-300 mb-5">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>प्राकृतिक नेपाली भाषा:</strong> पूर्वनिर्धारित रूपमा शुद्ध, आत्मीय र स्पष्ट नेपाली आवाज।</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>आवाज-पहिलो (Voice-First):</strong> शून्य-स्पर्श (Zero-Touch) र स्थानीय वेक-वर्ड "BHAPUMA" / "भपुम"।</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>यन्त्र नियन्त्रण:</strong> कल पुष्टि, SMS, WhatsApp, YouTube, भोल्युम र फ्ल्यासलाइटको पूर्ण नियन्त्रण।</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>अफलाइन मोड:</strong> इन्टरनेट नहुँदा पनि यन्त्रका सबै स्थानीय कामहरू सम्पन्न गर्छ।</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
        >
          बन्द गर्नुहोस्
        </button>
      </div>
    </div>
  );
};
