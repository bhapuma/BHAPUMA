import React, { useEffect, useRef } from 'react';
import { AssistantState } from '../types';
import { Mic, Radio, Sparkles, Volume2, WifiOff, AlertCircle } from 'lucide-react';

interface BhapumaOrbProps {
  state: AssistantState;
  onClick: () => void;
  isListening: boolean;
  analyserNode: AnalyserNode | null;
}

export const BhapumaOrb: React.FC<BhapumaOrbProps> = ({
  state,
  onClick,
  isListening,
  analyserNode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Real-time canvas particle / ripple animation responding to sound & state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    const dataArray = new Uint8Array(analyserNode ? analyserNode.frequencyBinCount : 32);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 75;

      let soundIntensity = 0;
      if (analyserNode && (state === 'LISTENING' || state === 'SPEAKING')) {
        analyserNode.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        soundIntensity = sum / (dataArray.length * 255);
      } else if (state === 'SPEAKING') {
        soundIntensity = 0.4 + Math.sin(angle * 6) * 0.25;
      } else if (state === 'LISTENING') {
        soundIntensity = 0.2 + Math.sin(angle * 4) * 0.15;
      }

      angle += 0.035;

      // Color themes depending on state
      let primaryColor = 'rgba(6, 182, 212, '; // Cyan
      let secondaryColor = 'rgba(99, 102, 241, '; // Indigo
      let accentColor = 'rgba(168, 85, 247, '; // Purple

      if (state === 'THINKING') {
        primaryColor = 'rgba(16, 185, 129, '; // Emerald
        secondaryColor = 'rgba(6, 182, 212, '; // Cyan
        accentColor = 'rgba(52, 211, 153, ';
      } else if (state === 'SPEAKING') {
        primaryColor = 'rgba(59, 130, 246, '; // Blue
        secondaryColor = 'rgba(6, 182, 212, '; // Cyan
        accentColor = 'rgba(236, 72, 153, '; // Pink
      } else if (state === 'OFFLINE') {
        primaryColor = 'rgba(245, 158, 11, '; // Amber
        secondaryColor = 'rgba(217, 119, 6, ';
        accentColor = 'rgba(251, 191, 36, ';
      } else if (state === 'ERROR') {
        primaryColor = 'rgba(239, 68, 68, '; // Red
        secondaryColor = 'rgba(244, 63, 94, ';
        accentColor = 'rgba(251, 113, 133, ';
      }

      // Outer animated ripple rings
      const ringCount = state === 'SPEAKING' || state === 'LISTENING' ? 4 : 2;
      for (let r = 1; r <= ringCount; r++) {
        const ringRadius = baseRadius + r * 20 + soundIntensity * 40 * r;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = primaryColor + `${Math.max(0.04, 0.25 / r - soundIntensity * 0.05)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Orbiting quantum particles / waveform nodes
      const particleCount = state === 'THINKING' ? 18 : 24;
      for (let i = 0; i < particleCount; i++) {
        const theta = (i / particleCount) * Math.PI * 2 + angle;
        const waveOffset = Math.sin(theta * 3 + angle * 2) * (10 + soundIntensity * 28);
        const radius = baseRadius + 18 + waveOffset;
        const x = centerX + Math.cos(theta) * radius;
        const y = centerY + Math.sin(theta) * radius;

        ctx.beginPath();
        ctx.arc(x, y, 2.5 + soundIntensity * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? primaryColor + '0.9)' : accentColor + '0.9)';
        ctx.shadowBlur = 12;
        ctx.shadowColor = primaryColor + '1)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Dynamic frequency wave spikes around perimeter
      if (state === 'LISTENING' || state === 'SPEAKING' || state === 'THINKING') {
        const numBars = 36;
        ctx.beginPath();
        for (let i = 0; i <= numBars; i++) {
          const theta = (i / numBars) * Math.PI * 2;
          const barHeight = Math.sin(i * 1.4 + angle * 3) * (soundIntensity * 35) + 6;
          const r1 = baseRadius + 4;
          const r2 = r1 + Math.max(0, barHeight);

          const x1 = centerX + Math.cos(theta) * r1;
          const y1 = centerY + Math.sin(theta) * r1;
          const x2 = centerX + Math.cos(theta) * r2;
          const y2 = centerY + Math.sin(theta) * r2;

          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
        ctx.strokeStyle = primaryColor + '0.85)';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, analyserNode]);

  // Status text in pure Nepali
  const getStateNepaliLabel = (s: AssistantState) => {
    switch (s) {
      case 'LISTENING':
        return { label: 'सुन्दैछु...', sub: 'Listening to your voice', color: 'text-cyan-400', icon: Mic };
      case 'THINKING':
        return { label: 'सोच्दैछु...', sub: 'Processing with Gemini Live', color: 'text-emerald-400', icon: Sparkles };
      case 'SPEAKING':
        return { label: 'बोल्दैछु...', sub: 'Bhapuma is speaking', color: 'text-blue-400', icon: Volume2 };
      case 'OFFLINE':
        return { label: 'अफलाइन मोड', sub: 'Local Device Commands Ready', color: 'text-amber-400', icon: WifiOff };
      case 'ERROR':
        return { label: 'सम्पर्क समस्या', sub: 'Tap to retry connection', color: 'text-rose-400', icon: AlertCircle };
      case 'IDLE':
      default:
        return { label: 'निष्क्रिय (तयार)', sub: 'भन्नुहोस् "BHAPUMA" वा ट्याप गर्नुहोस्', color: 'text-zinc-400', icon: Radio };
    }
  };

  const statusInfo = getStateNepaliLabel(state);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="flex flex-col items-center justify-center select-none relative z-10 w-full my-auto py-4">
      {/* Interactive Hologram Orb Container */}
      <div 
        onClick={onClick}
        className="relative w-80 h-80 flex items-center justify-center cursor-pointer group transition-transform active:scale-95 touch-manipulation"
        title="Tap to activate BHAPUMA voice assistant"
      >
        {/* Dynamic Canvas Background - Centered perfectly */}
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] pointer-events-none z-0"
        />

        {/* Central Core Glowing Orb */}
        <div 
          className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl ${
            state === 'LISTENING'
              ? 'bg-gradient-to-tr from-cyan-600/60 via-indigo-900/80 to-cyan-400/40 border-2 border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.65)] scale-105'
              : state === 'THINKING'
              ? 'bg-gradient-to-tr from-emerald-600/60 via-teal-950/80 to-cyan-400/40 border-2 border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.65)] animate-pulse'
              : state === 'SPEAKING'
              ? 'bg-gradient-to-tr from-blue-600/60 via-indigo-950/80 to-pink-500/40 border-2 border-blue-400 shadow-[0_0_55px_rgba(59,130,246,0.7)] scale-105'
              : state === 'OFFLINE'
              ? 'bg-gradient-to-tr from-amber-900/60 via-zinc-950/90 to-amber-600/30 border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
              : state === 'ERROR'
              ? 'bg-gradient-to-tr from-rose-950/80 via-zinc-950/90 to-rose-600/40 border border-rose-500/50 shadow-[0_0_35px_rgba(239,68,68,0.4)]'
              : 'bg-gradient-to-tr from-cyan-950/40 via-zinc-900/90 to-indigo-950/40 border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.25)] group-hover:border-cyan-400 group-hover:shadow-[0_0_45px_rgba(6,182,212,0.45)]'
          }`}
        >
          {/* Internal core light ring */}
          <div className="absolute inset-2 rounded-full border border-white/15 backdrop-blur-sm pointer-events-none" />
          
          {/* Center Brand Icon / Micro-Visualizer */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <StatusIcon className={`w-8 h-8 ${statusInfo.color} mb-1 transition-transform group-hover:scale-110`} />
            <span className="text-[11px] font-bold font-['Orbitron',sans-serif] tracking-widest text-white/90">
              BHAPUMA
            </span>
            <span className="text-[9px] text-cyan-300/80 font-medium">
              भपुम
            </span>
          </div>
        </div>
      </div>

      {/* State Indicator Text in Nepali & English Subtitle */}
      <div className="mt-7 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-lg">
          <span className={`w-2 h-2 rounded-full ${
            state === 'LISTENING' ? 'bg-cyan-400 animate-ping' :
            state === 'THINKING' ? 'bg-emerald-400 animate-pulse' :
            state === 'SPEAKING' ? 'bg-blue-400 animate-bounce' :
            state === 'OFFLINE' ? 'bg-amber-400' :
            state === 'ERROR' ? 'bg-rose-400' : 'bg-zinc-500'
          }`} />
          <p className={`text-base sm:text-lg font-bold tracking-wide ${statusInfo.color}`}>
            {statusInfo.label}
          </p>
        </div>
        <p className="text-xs text-zinc-500 mt-1.5 font-medium">
          {statusInfo.sub}
        </p>
      </div>
    </div>
  );
};
