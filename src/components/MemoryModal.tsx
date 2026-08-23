import React, { useState } from 'react';
import { X, Brain, Trash2, Plus, ShieldCheck } from 'lucide-react';
import { UserMemory } from '../types';

interface MemoryModalProps {
  memory: UserMemory;
  onSaveMemory: (key: string, value: string) => void;
  onClearMemory: () => void;
  onClose: () => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  memory,
  onSaveMemory,
  onClearMemory,
  onClose,
}) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    onSaveMemory(newKey.trim(), newValue.trim());
    setNewKey('');
    setNewValue('');
  };

  const memoryEntries = Object.entries(memory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md rounded-3xl bg-[#090a10] border border-cyan-500/30 p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Brain className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">सहायक मेमोरी (Memory Manager)</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
          भपुम (BHAPUMA) ले तपाईंको नाम र आवश्यकता अनुसारका विवरणहरू सम्झन्छ। तपाईं जुनसुकै बेला यो डाटा हटाउन सक्नुहुन्छ।
        </p>

        {/* Stored Key-Value List */}
        <div className="max-h-48 overflow-y-auto space-y-2 mb-4 pr-1">
          {memoryEntries.length === 0 ? (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-zinc-500">
              हाल कुनै व्यक्तिगत मेमोरी सेभ गरिएको छैन।
            </div>
          ) : (
            memoryEntries.map(([k, v]) => (
              <div
                key={k}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-cyan-300 font-mono">{k}:</span>
                <span className="text-white font-medium truncate max-w-[200px]">
                  {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Add Memory Form */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Key (e.g. city)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-cyan-400"
          />
          <input
            type="text"
            placeholder="Value (e.g. Kathmandu)"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs flex items-center gap-1 hover:bg-cyan-400 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Privacy Action */}
        <div className="flex gap-2">
          <button
            onClick={onClearMemory}
            className="flex-1 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>मेमोरी खाली गर्नुहोस् (Clear)</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all"
          >
            सम्पन्न
          </button>
        </div>
      </div>
    </div>
  );
};
