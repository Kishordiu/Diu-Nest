'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useMission } from '@/lib/mission-context';
import { SourceBadge } from '@/components/ui/RealDataUI';

interface Props { onNext?: () => void; }

export function PreMortem({ onNext }: Props) {
  const { mission } = useMission();
  const suppliers = mission.discoveredSuppliers;

  // Generate risk scenarios from actual risk signals
  const scenarios = suppliers.flatMap(s => s.riskSignals.map(r => ({
    title: r.title,
    description: r.description,
    severity: r.severity,
    supplier: s.name.value || 'Unknown',
    recommendation: r.recommendation,
  })));

  return (
    <div className="min-h-full bg-[#FBFBF8] text-[#181922] flex flex-col items-center py-12 px-8">
      <motion.h1 className="font-display text-4xl md:text-5xl font-bold tracking-wider mb-4 text-center"
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        PRE-MORTEM ANALYSIS
      </motion.h1>
      <p className="text-[#7A7F8D] text-sm font-mono tracking-wider mb-8 text-center">
        Risk scenarios derived from actual evidence gaps
      </p>

      {scenarios.length > 0 ? (
        <div className="w-full max-w-3xl space-y-4">
          {scenarios.map((s, i) => (
            <motion.div key={i} className={`surface-panel p-5 border-l-2 ${
              s.severity === 'high' ? 'border-l-[#FF5FA2]' : s.severity === 'medium' ? 'border-l-[#FFB86B]' : 'border-l-[#181922]/10'
            }`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[9px] tracking-widest font-mono px-1.5 py-0.5 rounded ${
                  s.severity === 'high' ? 'text-[#FF5FA2] bg-[#FF5FA2]/10' :
                  s.severity === 'medium' ? 'text-[#FFB86B] bg-[#FFB86B]/10' : 'text-[#7A7F8D] bg-[#181922]/5'
                }`}>{s.severity.toUpperCase()}</span>
                <span className="text-xs font-mono text-[#7A7F8D]">{s.supplier}</span>
              </div>
              <h3 className="font-mono text-[#181922] text-sm mb-1 font-medium">{s.title}</h3>
              <p className="text-xs text-[#7A7F8D] font-mono mb-2">{s.description}</p>
              <p className="text-[10px] text-[#6C63FF] font-mono font-medium">→ {s.recommendation}</p>
            </motion.div>
          ))}
          <div className="pt-2">
            <SourceBadge label="calculated" />
          </div>
        </div>
      ) : (
        <div className="surface-panel p-8 max-w-md text-center">
          <p className="text-[#7A7F8D] font-mono text-sm">No risk signals detected from available data.</p>
          <p className="text-[#969AA6] font-mono text-xs mt-2">This may mean risks exist but are undetected due to limited data.</p>
        </div>
      )}

      {onNext && (
        <button onClick={onNext} className="mt-8 editorial-btn editorial-btn-primary px-8 py-3 tracking-widest font-bold uppercase">
          Continue
        </button>
      )}
    </div>
  );
}

export default PreMortem;
