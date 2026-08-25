import React from 'react';
import { BatteryCharging, Battery, Wifi, WifiOff, Radio, ShieldCheck } from 'lucide-react';
import { DeviceTelemetry } from '../types';

// URL 2 for Bharat Pun Magar avatar (Top-Left branding & profile)
const BHARAT_TOP_AVATAR_URL = 'https://i.postimg.cc/NM3bpncb/d4595745d5fa611b8f8da9861b2cf43d-0.webp';

interface HeaderBarProps {
  telemetry: DeviceTelemetry;
  nepaliTime: string;
  isBackgroundActive: boolean;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  telemetry,
  nepaliTime,
  isBackgroundActive,
  onOpenSettings,
  onOpenAbout,
}) => {
  return (
    <header className="w-full px-4 pt-3 pb-2 flex items-center justify-between border-b border-white/5 bg-[#030306]/80 backdrop-blur-md sticky top-0 z-30 select-none">
      {/* Left: Official BHAPUMA Branding */}
      <div 
        onClick={onOpenAbout}
        className="flex items-center gap-3 cursor-pointer group transition-all"
        title="BHAPUMA Assistant Profile"
      >
        <div className="relative">
          <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-cyan-500 via-indigo-500 to-amber-400 shadow-[0_0_15px_rgba(6,182,212,0.35)] group-hover:shadow-[0_0_22px_rgba(6,182,212,0.6)] transition-all">
            <img
              src={BHARAT_TOP_AVATAR_URL}
              alt="Bharat Pun Magar (BHAPUMA)"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full bg-black/50"
            />
          </div>
          {isBackgroundActive && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#030306] rounded-full animate-pulse" title="Foreground Voice Service Active" />
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-wider font-['Orbitron',sans-serif] bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent group-hover:text-cyan-300 transition-colors">
              BHAPUMA
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 font-medium tracking-tight">
              भपुम AI
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-medium tracking-wide">
            Bharat Pun Magar
          </p>
        </div>
      </div>

      {/* Right: Android Status Bar & Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 text-xs text-zinc-300">
        {/* Background Service Status */}
        <div 
          onClick={onOpenSettings}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer"
          title="Android Foreground Service"
        >
          <Radio className={`w-3.5 h-3.5 ${isBackgroundActive ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
          <span className="text-[11px] text-zinc-400">
            {isBackgroundActive ? 'Background Live' : 'Foreground'}
          </span>
        </div>

        {/* Network Status */}
        <div 
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border ${
            telemetry.isOnline 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}
          title={telemetry.isOnline ? 'Online' : 'Offline Mode'}
        >
          {telemetry.isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="hidden xs:inline">{telemetry.isOnline ? 'Online' : 'अफलाइन'}</span>
        </div>

        {/* Battery Status */}
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-medium"
          title={`Battery: ${telemetry.batteryLevel}%`}
        >
          {telemetry.isCharging ? (
            <BatteryCharging className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
          ) : (
            <Battery className={`w-3.5 h-3.5 ${telemetry.batteryLevel < 20 ? 'text-rose-400' : 'text-zinc-300'}`} />
          )}
          <span>{telemetry.batteryLevel}%</span>
        </div>

        {/* Live Nepali Time Clock */}
        <div className="hidden md:block px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-semibold text-cyan-300 tracking-wider">
          {nepaliTime}
        </div>
      </div>
    </header>
  );
};
