'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMission } from '@/lib/mission-context';

interface RequirementConfirmProps { onNext: () => void; }

export default function RequirementConfirm({ onNext }: RequirementConfirmProps) {
  const { mission, dispatch } = useMission();
  const req = mission.requirement;
  const [edits, setEdits] = useState<Record<string, string>>({});

  if (!req) return <div className="min-h-screen flex items-center justify-center font-mono text-[#7A7F8D]">No requirement data</div>;

  const constraints = req.allConstraints;

  const updateField = (field: string, value: string) => {
    setEdits(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    if (Object.keys(edits).length > 0) {
      const updated = { ...req };
      updated.allConstraints = constraints.map(c => {
        if (edits[c.field]) return { ...c, value: edits[c.field], source: 'explicit' as const, extractionConfidence: 100 };
        return c;
      });
      dispatch({ type: 'SET_REQUIREMENT', requirement: updated });
    }
    onNext();
  };

  return (
    <div className="min-h-full flex flex-col pt-12 pb-24 px-8 md:px-16 lg:px-24">
      
      {/* Header */}
      <div className="w-full flex-shrink-0 z-20 mb-16">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <p className="label-meta text-[#969AA6] mb-4">PHASE 01 // VALIDATION</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-[#181922]">
            Lock Parameters
          </h1>
        </motion.div>
      </div>

      <div className="w-full max-w-4xl flex flex-col gap-8">
        
        <motion.div 
          className="flex items-center justify-between border-b border-[#181922]/10 pb-4 mb-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        >
          <div className="text-[9px] tracking-[0.2em] font-mono text-[#969AA6] uppercase">Parameter</div>
          <div className="text-[9px] tracking-[0.2em] font-mono text-[#969AA6] uppercase">Action</div>
        </motion.div>

        <div className="flex flex-col gap-2">
          {constraints.map((c, i) => (
            <motion.div 
              key={c.field} 
              className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border border-[#181922]/6 rounded-xl focus-within:border-[#6C63FF] focus-within:shadow-[0_0_0_3px_rgba(108,99,255,0.08)] transition-all"
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-6 md:w-2/3">
                <div className="w-24 shrink-0">
                  <span className="text-[9px] tracking-[0.2em] font-mono text-[#969AA6] uppercase">{c.field}</span>
                </div>

                <div className="w-px h-8 bg-[#181922]/6 hidden md:block" />

                <input
                  type="text"
                  value={edits[c.field] !== undefined ? edits[c.field] : c.value}
                  onChange={(e) => updateField(c.field, e.target.value)}
                  className="flex-1 bg-transparent text-[#181922] font-mono text-sm py-2 px-3 border-b border-[#181922]/10 focus:border-[#6C63FF] outline-none transition-colors placeholder-[#969AA6]"
                />
              </div>

              <div className="flex items-center mt-4 md:mt-0 md:justify-end gap-4 shrink-0">
                <span className={`text-[8px] font-mono tracking-widest uppercase px-2 py-1 rounded ${
                  c.source === 'explicit' ? 'text-[#6C63FF] bg-[#6C63FF]/10' : 'text-[#FFB86B] bg-[#FFB86B]/10'
                }`}>
                  {c.source.substring(0, 4)}
                </span>
                <span className={`text-[8px] font-mono tracking-widest uppercase px-2 py-1 rounded border ${
                  c.type === 'hard' ? 'border-[#FF5FA2]/50 text-[#FF5FA2]' : 'border-[#181922]/10 text-[#969AA6]'
                }`}>
                  {c.type === 'hard' ? 'BLOCKER' : 'PREF'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-12 border-t border-[#181922]/6 pt-12 flex gap-6" 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        >
          <button onClick={handleConfirm} className="editorial-btn editorial-btn-primary rounded-full px-8 py-3">
            <span className="tracking-widest text-[11px] uppercase font-bold">Lock Parameters &amp; Initiate Search</span>
            <span className="font-mono text-xs opacity-70 ml-2">&rarr;</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
