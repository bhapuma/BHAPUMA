import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ExternalLink,
  Search,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Camera as CameraIcon,
  Wifi,
  Bluetooth,
  Bell,
  Battery,
  Shield,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import { InstalledApp } from '../types';

interface ActiveAppModalProps {
  app: InstalledApp | null;
  initialQuery?: string;
  onClose: () => void;
}

export const ActiveAppModal: React.FC<ActiveAppModalProps> = ({
  app,
  initialQuery = '',
  onClose,
}) => {
  if (!app) return null;

  const [youtubeQuery, setYoutubeQuery] = useState(initialQuery || 'Nepali Acoustic Songs');
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrev, setCalcPrev] = useState<string | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Camera stream cleanup/init
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (app.id === 'camera' && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            setCameraActive(true);
          }
        })
        .catch((e) => {
          console.warn('Camera access error:', e);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [app.id]);

  // Calculator logic
  const handleCalcNum = (n: string) => {
    setCalcDisplay((prev) => (prev === '0' ? n : prev + n));
  };
  const handleCalcOp = (op: string) => {
    setCalcPrev(calcDisplay);
    setCalcOp(op);
    setCalcDisplay('0');
  };
  const handleCalcEqual = () => {
    if (!calcPrev || !calcOp) return;
    const a = parseFloat(calcPrev);
    const b = parseFloat(calcDisplay);
    let res = 0;
    if (calcOp === '+') res = a + b;
    if (calcOp === '-') res = a - b;
    if (calcOp === '×') res = a * b;
    if (calcOp === '÷') res = b !== 0 ? a / b : 0;
    setCalcDisplay(String(res));
    setCalcPrev(null);
    setCalcOp(null);
  };
  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcPrev(null);
    setCalcOp(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg animate-fadeIn select-none">
      <div className="w-full max-w-lg h-[85vh] max-h-[700px] rounded-3xl bg-[#090a10] border border-cyan-500/30 flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden relative">
        {/* App Title Bar (Android OS Window Frame) */}
        <div className="px-4 py-3 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: app.color }}
            >
              {app.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-none">{app.name}</h2>
              <span className="text-[10px] text-zinc-400 font-mono">{app.packageName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {app.webUrl && (
              <a
                href={app.webUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 text-xs flex items-center gap-1 transition-all"
                title="Open in Browser / External App"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">External</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* App Body Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col bg-[#05060a]">
          {/* 1. YouTube App View */}
          {app.id === 'youtube' && (
            <div className="flex flex-col h-full gap-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="text"
                    value={youtubeQuery}
                    onChange={(e) => setYoutubeQuery(e.target.value)}
                    placeholder="Search YouTube..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-red-500 outline-none"
                  />
                </div>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>खोज्नुहोस्</span>
                </a>
              </div>

              {/* YouTube Search Quick Links & Player */}
              <div className="flex-1 rounded-2xl bg-white/[0.02] border border-white/5 p-4 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center mb-3">
                  <Play className="w-8 h-8 ml-1" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  YouTube: "{youtubeQuery}"
                </h3>
                <p className="text-xs text-zinc-400 max-w-xs mb-4">
                  युट्युबमा यो भिडियो वा खोज परिणाम हेर्न तलको बटन थिच्नुहोस्:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-600/30"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>YouTube मा हेर्नुहोस्</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 2. Calculator App View */}
          {app.id === 'calculator' && (
            <div className="flex flex-col h-full max-w-xs mx-auto justify-end gap-2 pb-2">
              <div className="bg-black/60 border border-white/10 rounded-2xl p-4 text-right mb-2 shadow-inner">
                {calcOp && (
                  <div className="text-xs text-zinc-400 font-mono mb-1">
                    {calcPrev} {calcOp}
                  </div>
                )}
                <div className="text-3xl font-extrabold text-cyan-300 font-mono truncate">
                  {calcDisplay}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-sm font-bold">
                <button onClick={handleCalcClear} className="p-3.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30">C</button>
                <button onClick={() => handleCalcOp('÷')} className="p-3.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30">÷</button>
                <button onClick={() => handleCalcOp('×')} className="p-3.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30">×</button>
                <button onClick={() => handleCalcOp('-')} className="p-3.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30">-</button>

                <button onClick={() => handleCalcNum('7')} className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white">7</button>
                <button onClick={() => handleCalcNum('8')} className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white">8</button>
                <button onClick={() => handleCalcNum('9')} className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white">9</button>
                <button onClick={() => handleCalcOp('+')} className="p-3.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30">+</button>

                <button onClick={() => handleCalcNum('4')} className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white">4</button>
                <button onClick={() => handleCalcNum('5')} className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white">5</button>
                <button onClick={() => handleCalcNum('6')} className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white">6</button>
                <button onClick={handleCalcEqual} className="row-span-2 p-3.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-black font-extrabold flex items-center justify-center">=</button>

                <button onClick={() => handleCalcNum('1')} className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white">1</button>
                <button onClick={() => handleCalcNum('2')} className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white">2</button>
                <button onClick={() => handleCalcNum('3')} className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white">3</button>

                <button onClick={() => handleCalcNum('0')} className="col-span-2 p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white">0</button>
                <button onClick={() => handleCalcNum('.')} className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white">.</button>
              </div>
            </div>
          )}

          {/* 3. Camera View */}
          {app.id === 'camera' && (
            <div className="flex flex-col h-full items-center justify-center">
              <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <CameraIcon className="w-12 h-12 text-zinc-500 mb-2" />
                    <p className="text-xs text-zinc-400">क्यामेरा अनुमति सक्रिय गर्नुहोस् वा खोल्नुहोस्</p>
                  </div>
                )}
                {/* Shutter overlay */}
                <div className="absolute bottom-4 inset-x-0 flex justify-center">
                  <button 
                    onClick={() => alert('फोटो खिचियो (Snapshot captured)')}
                    className="w-14 h-14 rounded-full border-4 border-white bg-white/20 active:bg-white transition-all shadow-lg" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Settings View */}
          {app.id === 'settings' && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Android System Settings
              </h3>
              {[
                { icon: Wifi, title: 'Wi-Fi', desc: 'Connected (High Speed 5GHz)', color: 'text-cyan-400' },
                { icon: Bluetooth, title: 'Bluetooth', desc: 'Active & Paired', color: 'text-blue-400' },
                { icon: Bell, title: 'Notifications', desc: 'BHAPUMA Assistant Priority', color: 'text-amber-400' },
                { icon: Battery, title: 'Battery Saver', desc: 'Optimized for Background Assistant', color: 'text-emerald-400' },
                { icon: Shield, title: 'Privacy & Permissions', desc: 'Audio, Contacts, Camera', color: 'text-purple-400' },
                { icon: Smartphone, title: 'About Phone', desc: 'Android 15 — BHAPUMA Edition', color: 'text-indigo-400' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white/5 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{item.title}</div>
                        <div className="text-xs text-zinc-400">{item.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Default Web-Based or External Launch */}
          {app.id !== 'youtube' && app.id !== 'calculator' && app.id !== 'camera' && app.id !== 'settings' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-2xl mb-4"
                style={{ backgroundColor: app.color }}
              >
                {app.name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{app.name}</h3>
              <p className="text-xs text-zinc-400 mb-6 font-mono">{app.packageName}</p>
              {app.webUrl ? (
                <a
                  href={app.webUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <span>एप सिधै खोल्नुहोस्</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <p className="text-xs text-zinc-400">यो एप सफलतापूर्वक प्रणालीमा सक्रिय गरिएको छ।</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
