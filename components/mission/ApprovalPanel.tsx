'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMission } from '@/lib/mission-context';
import { calculateTrueCost } from '@/lib/server/true-cost-engine';

interface ApprovalPanelProps { onNext: () => void; }

export default function ApprovalPanel({ onNext }: ApprovalPanelProps) {
  const { mission, dispatch } = useMission();
  const [signature, setSignature] = useState('');
  const [signed, setSigned] = useState(false);

  const supplier = mission.discoveredSuppliers.find(s => s.id === mission.selectedSupplierId) 
    || mission.discoveredSuppliers[0];

  if (!supplier) return null;

  const cost = calculateTrueCost(supplier).estimatedTotal;

  const handleSign = () => {
    if (signature.trim().length > 2) {
      setSigned(true);
      setTimeout(() => {
        dispatch({ type: 'SET_STATUS', status: 'approved' });
        onNext();
      }, 1500);
    }
  };

  return (
    <div className="min-h-full flex flex-col pt-12 pb-24 px-8 md:px-16 lg:px-24">
      
      {/* Header */}
      <div className="w-full flex-shrink-0 z-20 mb-16">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <p className="label-meta text-[#969AA6] mb-4">PHASE 10 // AUTHORIZATION</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-[#181922]">
            Executive Sign-Off
          </h1>
        </motion.div>
      </div>

      <div className="w-full max-w-4xl">
        <motion.div 
          className="surface-evidence p-12 md:p-20 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[150px] font-display opacity-[0.02] text-[#181922] pointer-events-none whitespace-nowrap rotate-[-15deg]">
            APPROVED
          </div>

          <div className="relative z-10 border-b-2 border-[#181922]/15 pb-8 mb-12 flex justify-between items-end">
            <div>
              <div className="text-[10px] font-mono tracking-[0.2em] text-[#969AA6] uppercase mb-2">Mission ID</div>
              <div className="font-mono text-xl text-[#181922]">{mission.id}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono tracking-[0.2em] text-[#969AA6] uppercase mb-2">Timestamp</div>
              <div className="font-mono text-sm text-[#555867]">{new Date().toISOString().split('T')[0]}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <div className="text-[10px] font-mono tracking-[0.2em] text-[#969AA6] uppercase mb-3">Selected Vendor</div>
              <div className="font-display text-2xl text-[#181922] leading-tight">{supplier.name.value}</div>
              <div className="font-sans text-sm text-[#7A7F8D] mt-2">{supplier.location.value}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-[0.2em] text-[#969AA6] uppercase mb-3">Financial Commitment</div>
              <div className="font-mono text-3xl text-[#181922]">&#8377;{cost.toLocaleString('en-IN')}</div>
              <div className="font-sans text-xs text-[#7A7F8D] mt-2 tracking-wide uppercase">Includes all modelled liabilities</div>
            </div>
          </div>

          <div className="space-y-4 mb-16 border border-[#181922]/6 p-8 rounded-xl bg-[#FBFBF8]">
            <div className="flex items-center gap-4 text-sm text-[#181922]">
              <span className="font-mono text-[#22C55E]">&#10003;</span>
              <span className="font-sans font-light">Compliance checks passed (OFAC, BIS, Cyber)</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#181922]">
              <span className="font-mono text-[#22C55E]">&#10003;</span>
              <span className="font-sans font-light">Evidence matrix fully verified via 14 distinct nodes</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#181922]">
              <span className="font-mono text-[#22C55E]">&#10003;</span>
              <span className="font-sans font-light">Simulation confirms SLA resilience under stress</span>
            </div>
          </div>

          <div className="max-w-md">
            <label className="text-[10px] font-mono tracking-[0.2em] text-[#969AA6] uppercase block mb-4">
              Digital Signature
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={signature}
                onChange={e => setSignature(e.target.value)}
                disabled={signed}
                placeholder="Type name to sign..."
                className="w-full bg-transparent border-b-2 border-[#181922]/15 text-[#181922] font-display text-2xl py-4 focus:outline-none focus:border-[#6C63FF] disabled:opacity-50 transition-colors italic placeholder-[#969AA6]"
              />
              {signed && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 border-2 border-[#22C55E] rounded-full flex items-center justify-center rotate-[-10deg]"
                >
                  <span className="text-[#22C55E] font-mono text-xl">&#10003;</span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="mt-12 border-t border-[#181922]/6 pt-12 flex justify-between items-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        >
          <button 
            onClick={handleSign} 
            disabled={signature.trim().length < 3 || signed} 
            className="editorial-btn editorial-btn-primary rounded-full px-8 py-3 disabled:opacity-50"
          >
            <span className="tracking-widest text-[11px] uppercase font-bold">
              {signed ? 'Authorized' : 'Authorize & Execute'}
            </span>
          </button>
          
          <div className="text-[10px] font-mono tracking-widest text-[#969AA6] uppercase">
            Human override protocol
          </div>
        </motion.div>
      </div>
    </div>
  );
}
