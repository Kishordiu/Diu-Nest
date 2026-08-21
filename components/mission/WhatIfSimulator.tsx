'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMission } from '@/lib/mission-context';
import { calculateTrueCost } from '@/lib/server/true-cost-engine';

interface WhatIfSimulatorProps { onNext: () => void; }

export default function WhatIfSimulator({ onNext }: WhatIfSimulatorProps) {
  const { mission } = useMission();
  const [weights, setWeights] = useState({ delay: 0, defect: 0, customs: 0 });

  const suppliers = mission.discoveredSuppliers.map(sup => {
    const baseCost = calculateTrueCost(sup).estimatedTotal;
    const delayCost = weights.delay * 5000;
    const defectCost = (baseCost * weights.defect) / 100;
    const customsCost = (baseCost * weights.customs) / 100;
    const riskMultiplier = sup.dataConfidence < 70 ? 1.5 : 1;
    const simulatedTotal = baseCost + ((delayCost + defectCost + customsCost) * riskMultiplier);
    
    return { ...sup, baseCost, simulatedTotal };
  }).sort((a, b) => a.simulatedTotal - b.simulatedTotal);

  return (
    <div className="min-h-full flex flex-col pt-12 pb-24 px-8 md:px-16 lg:px-24 bg-base relative overflow-hidden">
      
      {/* Header */}
      <div className="w-full flex-shrink-0 z-20 mb-12 relative">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <p className="label-meta text-aurora-1 mb-4">PHASE 07 // WHAT-IF SIMULATION</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-text">
            Stress Test Model
          </h1>
          <p className="font-sans text-text/60 text-lg mt-4 max-w-2xl">
            Inject supply chain shocks. Watch the deterministic engine instantly re-rank vendors based on real vulnerability exposure.
          </p>
        </motion.div>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        
        {/* Controls - Left Side */}
        <div className="lg:col-span-4 space-y-8">
          <div className="liquid-glass-02 bg-white p-8 rounded-xl border border-text/10">
            <h3 className="font-mono text-[10px] tracking-widest text-text/50 uppercase mb-8 font-bold">Supply Chain Shocks</h3>
            
            {/* Control: Delay */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-mono uppercase tracking-widest font-semibold text-text">Port Delay</label>
                <span className="text-aurora-4 font-mono font-bold text-sm">+{weights.delay} Days</span>
              </div>
              <input type="range" min="0" max="30" value={weights.delay} onChange={(e) => setWeights({...weights, delay: Number(e.target.value)})}
                className="w-full h-1 bg-text/10 rounded-full appearance-none accent-aurora-4"
              />
            </div>

            {/* Control: Defect */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-mono uppercase tracking-widest font-semibold text-text">Defect Spike</label>
                <span className="text-aurora-5 font-mono font-bold text-sm">+{weights.defect}%</span>
              </div>
              <input type="range" min="0" max="25" value={weights.defect} onChange={(e) => setWeights({...weights, defect: Number(e.target.value)})}
                className="w-full h-1 bg-text/10 rounded-full appearance-none accent-aurora-5"
              />
            </div>

            {/* Control: Customs */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-mono uppercase tracking-widest font-semibold text-text">Tariff Hike</label>
                <span className="text-aurora-2 font-mono font-bold text-sm">+{weights.customs}%</span>
              </div>
              <input type="range" min="0" max="40" value={weights.customs} onChange={(e) => setWeights({...weights, customs: Number(e.target.value)})}
                className="w-full h-1 bg-text/10 rounded-full appearance-none accent-aurora-2"
              />
            </div>
          </div>
        </div>

        {/* Physics Ranking Board - Right Side */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between border-b border-text/10 pb-4 mb-6">
            <div className="text-[10px] tracking-widest font-mono text-text/40 uppercase">Vendor Ranking</div>
            <div className="text-[10px] tracking-widest font-mono text-text/40 uppercase">Simulated True Cost</div>
          </div>

          <div className="space-y-4 relative">
            <AnimatePresence>
              {suppliers.map((sup, index) => {
                const diff = sup.simulatedTotal - sup.baseCost;
                
                return (
                  <motion.div
                    key={sup.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="liquid-glass-02 bg-white p-6 rounded-xl flex items-center justify-between border border-text/5 hover:border-text/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-8 h-8 rounded-full bg-base border border-text/10 flex items-center justify-center font-display text-text font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-xl text-text mb-1">{sup.name.value}</h4>
                        <div className="flex gap-4 text-[10px] font-mono tracking-widest text-text/50 uppercase">
                          <span>Base: ${sup.baseCost.toLocaleString()}</span>
                          <span>Risk: {sup.dataConfidence < 70 ? 'HIGH' : 'LOW'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end">
                      <span className="font-mono text-2xl font-bold text-text">
                        ${sup.simulatedTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                      {diff > 0 && (
                        <motion.span 
                          key={diff}
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                          className="text-[10px] font-mono tracking-widest text-critical-red font-bold mt-1"
                        >
                          +${diff.toLocaleString(undefined, { maximumFractionDigits: 0 })} EXPOSURE
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <motion.div 
        className="mt-12 flex justify-end pt-8 border-t border-text/10 z-10 relative" 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
      >
        <button onClick={onNext} className="btn-signature">
          <span>GENERATE DIGITAL TWIN</span>
        </button>
      </motion.div>
    </div>
  );
}
