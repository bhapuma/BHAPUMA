import React from 'react';
import { X, Mic, Users, Phone, Bell, Camera, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { PermissionStatus } from '../types';

interface PermissionsModalProps {
  permissions: PermissionStatus;
  onTogglePermission: (key: keyof PermissionStatus) => void;
  onClose: () => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
  permissions,
  onTogglePermission,
  onClose,
}) => {
  const items: {
    key: keyof PermissionStatus;
    title: string;
    titleNepali: string;
    desc: string;
    icon: any;
  }[] = [
    {
      key: 'microphone',
      title: 'RECORD_AUDIO',
      titleNepali: 'माइक्रोफोन (Microphone)',
      desc: 'आवाज सुन्न र "BHAPUMA" वेक-वर्ड पत्ता लगाउन आवश्यक छ।',
      icon: Mic,
    },
    {
      key: 'contacts',
      title: 'READ_CONTACTS',
      titleNepali: 'सम्पर्क सूची (Contacts)',
      desc: 'नामबाट फोन नम्बर खोज्न र कल/मेसेज तयार गर्न आवश्यक छ।',
      icon: Users,
    },
    {
      key: 'phone',
      title: 'CALL_PHONE',
      titleNepali: 'फोन कल (Phone Calls)',
      desc: 'पुष्टि पश्चात सिधै फोन कल डायल गर्न प्रयोग गरिन्छ।',
      icon: Phone,
    },
    {
      key: 'notifications',
      title: 'POST_NOTIFICATIONS',
      titleNepali: 'सूचनाहरू (Notifications)',
      desc: 'ब्याकग्राउन्डमा भपुमलाई सक्रिय राख्न र स्थिति देखाउन आवश्यक छ।',
      icon: Bell,
    },
    {
      key: 'cameraTorch',
      title: 'CAMERA / TORCH',
      titleNepali: 'क्यामेरा र टर्च (Flashlight)',
      desc: 'फ्ल्यासलाइट बाल्न र फोटो खिच्न प्रयोग गरिन्छ।',
      icon: Camera,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md rounded-3xl bg-[#090a10] border border-cyan-500/30 p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">अनुमतिहरू (App Permissions)</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 mb-4">
          सुरक्षा र गोपनीयताका साथ एन्ड्रोइड सुविधाहरू संचालन गर्न तलका अनुमतिहरू सक्रिय गर्नुहोस्:
        </p>

        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {items.map((item) => {
            const Icon = item.icon;
            const granted = permissions[item.key];
            return (
              <div
                key={item.key}
                onClick={() => onTogglePermission(item.key)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  granted
                    ? 'bg-cyan-950/20 border-cyan-500/30'
                    : 'bg-white/[0.02] border-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl mt-0.5 ${granted ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.titleNepali}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">({item.title})</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <div className="ml-3">
                  {granted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-zinc-600 shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-bold text-sm shadow-md transition-all"
        >
          स्वीकार गर्नुहोस् (Confirm)
        </button>
      </div>
    </div>
  );
};
