'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMission } from '@/lib/mission-context';
import { StatusLabel } from '@/components/ui/RealDataUI';

interface ProcurementFirewallProps { onNext: () => void; }

export default function ProcurementFirewall({ onNext }: ProcurementFirewallProps) {
  const { mission } = useMission();
  const [scanIndex, setScanIndex] = useState(-1);
  const [scanning, setScanning] = useState(true);

  const supplier = mission.discoveredSuppliers.find(s => s.id === mission.selectedSupplierId) 
    || mission.discoveredSuppliers[0];

  const checks = [
    { id: 'ofac', name: 'OFAC Sanctions List', result: 'clear' },
    { id: 'bis', name: 'BIS Entity List', result: 'clear' },
    { id: 'cyber', name: 'Cybersecurity Incident DB', result: 'clear' },
    { id: 'esg', name: 'ESG Violation Registry', result: 'warning', detail: 'Pending 2024 water usage report' },
    { id: 'financial', name: 'Global Bankruptcy DB', result: 'clear' },
  ];

  useEffect(() => {
    if (scanIndex < checks.length) {
      const timer = setTimeout(() => setScanIndex(s => s + 1), 600);
      return () => clearTimeout(timer);
    } else {
      setScanning(false);
    }
  }, [scanIndex, checks.length]);

  return (
    <div className="min-h-full flex flex-col pt-12 pb-24 px-12 md:px-24">
      
      {/* Header */}
      <div className="w-full flex-shrink-0 z-20 mb-16">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <p className="label-meta text-[#969AA6] mb-4">PHASE 09 // COMPLIANCE FIREWALL</p>
          <h1 className="font-display text-4xl md:text-5xl font-normal tracking-wider text-[#181922] flex items-center gap-6">
            SECURITY MATRIX
            {scanning && <div className="w-4 h-4 bg-[#6C63FF] rounded-sm animate-pulse" />}
          </h1>
        </motion.div>
      </div>

      <div className="w-full max-w-4xl">
        <div className="surface-panel p-10 md:p-16">
          <div className="flex justify-between items-end mb-12 border-b border-[#181922]/10 pb-6">
            <div>
              <span className="font-mono text-[9px] tracking-[0.2em] text-[#969AA6] uppercase block mb-2">Target Entity</span>
              <span className="font-display text-2xl text-[#181922]">{supplier?.name.value || 'Unknown Entity'}</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-[9px] tracking-[0.2em] text-[#969AA6] uppercase block mb-2">System Status</span>
              <span className="font-mono text-sm uppercase font-semibold" style={{ color: scanning ? '#FFB86B' : '#22C55E' }}>
                {scanning ? 'SCAN IN PROGRESS' : 'GATES OPEN'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {checks.map((check, i) => {
              const isVisible = i <= scanIndex;
              const isScanning = i === scanIndex;
              const isDone = i < scanIndex;

              return (
                <motion.div 
                  key={check.id}
                  className="flex items-center justify-between p-4 border border-[#181922]/6 bg-[#FBFBF8] rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16">
                      {isScanning && <span className="font-mono text-[9px] text-[#6C63FF] tracking-widest uppercase animate-pulse font-medium">Scanning</span>}
                      {isDone && <span className="font-mono text-[9px] tracking-widest uppercase font-semibold" style={{ color: check.result === 'clear' ? '#22C55E' : '#FFB86B' }}>
                        {check.result === 'clear' ? 'Pass' : 'Warn'}
                      </span>}
                    </div>
                    <span className={`font-mono text-sm ${isDone ? 'text-[#181922]' : 'text-[#7A7F8D]'}`}>{check.name}</span>
                  </div>
                  
                  {isDone && check.detail && (
                    <span className="font-sans font-light text-xs text-[#555867] max-w-xs text-right hidden md:block">
                      {check.detail}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {!scanning && (
            <motion.div 
              className="mt-12 p-6 bg-[#6C63FF]/10 border border-[#6C63FF]/30 rounded-2xl flex items-center justify-between"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <span className="font-mono text-[#6C63FF] text-sm uppercase block mb-1 font-semibold">Clearance Granted</span>
                <span className="font-sans text-xs text-[#555867] font-light">No critical flags detected in global registries.</span>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#6C63FF] bg-white">
                <span className="text-[#6C63FF] font-mono text-sm font-bold">✓</span>
              </div>
            </motion.div>
          )}

        </div>
        
        <motion.div 
          className="mt-16 border-t border-text/10 pt-12 flex justify-end"
          initial={{ opacity: 0 }} animate={{ opacity: scanning ? 0 : 1 }} transition={{ delay: 0.2 }}
        >
          <button onClick={onNext} disabled={scanning} className="btn-signature disabled:opacity-50">
            <span>FORWARD TO HUMAN APPROVAL</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
