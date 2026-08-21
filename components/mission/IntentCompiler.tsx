'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMission } from '@/lib/mission-context';
import { SourceBadge } from '@/components/ui/RealDataUI';

interface IntentCompilerProps { onNext: () => void; }

export default function IntentCompiler({ onNext }: IntentCompilerProps) {
  const { mission } = useMission();
  const req = mission.requirement;
  const [revealed, setRevealed] = useState(0);

  const fields = req ? req.allConstraints.map(c => ({
    label: c.field.toUpperCase(),
    value: c.value || 'Not specified',
    type: c.source,
    confidence: c.extractionConfidence,
    constraintType: c.type,
  })) : [];

  useEffect(() => {
    if (fields.length === 0) return;
    const timer = setInterval(() => {
      setRevealed(r => r < fields.length ? r + 1 : r);
    }, 200);
    return () => clearInterval(timer);
  }, [fields.length]);

  return (
    <div className="min-h-full flex flex-col pt-12 pb-24 px-8 md:px-16 lg:px-24">
      
      {/* Header */}
      <div className="w-full flex-shrink-0 z-20 mb-12">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-text">
            Intent Ledger
          </h1>
        </motion.div>
      </div>

      <div className="w-full max-w-4xl flex flex-col gap-12">
        
        {/* Raw text display */}
        <motion.div 
          className="liquid-glass-02 p-8 md:p-10"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between border-b border-text/5 pb-4 mb-6">
            <div className="text-[10px] tracking-widest font-mono text-text/50 uppercase">Source Input</div>
            <div className="text-[10px] tracking-widest font-mono text-text/70 uppercase border border-text/20 px-3 py-1 rounded-full">HUMAN INTENT</div>
          </div>
          <p className="font-serif italic text-text/80 text-xl md:text-2xl leading-relaxed">
            &quot;{mission.rawInput || 'No input provided'}&quot;
          </p>
        </motion.div>

        {/* Extracted Ledger */}
        <div className="w-full">
          <motion.div 
            className="flex items-center justify-between border-b border-text/10 pb-4 mb-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          >
            <div className="text-[10px] tracking-widest font-mono text-text/50 uppercase">Deterministic Extraction</div>
            <div className="text-[10px] tracking-widest font-mono text-text/50 uppercase">Confidence</div>
          </motion.div>

          <div className="flex flex-col gap-2">
            {fields.map((field, i) => {
              const isExplicit = field.type === 'explicit';
              
              return (
                <motion.div 
                  key={field.label}
                  className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/50 hover:bg-white border border-text/5 transition-colors rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={i < revealed ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <div className="flex items-center gap-6 md:w-2/3">
                    {/* Status Indicator */}
                    <div className="w-12 text-center">
                      <span className={`text-[9px] font-mono tracking-widest uppercase font-bold ${
                        isExplicit ? 'text-aurora-1' : 'text-warning-amber'
                      }`}>
                        {isExplicit ? 'EXPL' : 'INFR'}
                      </span>
                    </div>

                    <div className="w-px h-8 bg-text/10 hidden md:block" />

                    {/* Field Data */}
                    <div className="flex flex-col">
                      <span className="text-[9px] tracking-widest font-mono text-text/50 uppercase mb-1">{field.label}</span>
                      <span className="font-mono text-sm font-semibold text-text">{field.value}</span>
                    </div>
                  </div>

                  {/* Meta Data */}
                  <div className="flex items-center justify-between mt-4 md:mt-0 md:w-1/3 md:justify-end gap-8">
                    <span className={`text-[9px] font-mono tracking-widest uppercase px-3 py-1 rounded-full border ${
                      field.constraintType === 'hard' ? 'border-text/20 text-text/70' : 'border-text/10 text-text/50'
                    }`}>
                      {field.constraintType === 'hard' ? 'Hard Rule' : 'Preference'}
                    </span>
                    
                    <span className="text-xs font-mono font-medium text-text/60 w-12 text-right">
                      {field.confidence}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div 
          className="mt-8 flex justify-end pt-8 border-t border-text/5" 
          initial={{ opacity: 0 }} 
          animate={revealed >= fields.length ? { opacity: 1 } : { opacity: 0 }}
        >
          <button 
            onClick={onNext} 
            className="editorial-btn editorial-btn-primary bg-aurora-gradient text-white border-none shadow-[0_4px_16px_rgba(108,99,255,0.2)] hover:shadow-[0_8px_24px_rgba(108,99,255,0.3)] rounded-full px-8 py-3"
          >
            <span className="tracking-widest text-[11px] uppercase font-bold">CONTINUE →</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
