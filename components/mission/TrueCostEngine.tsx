'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useMission } from '@/lib/mission-context';
import { calculateTrueCost } from '@/lib/server/true-cost-engine';

interface TrueCostEngineProps { onNext: () => void; }

export default function TrueCostEngine({ onNext }: TrueCostEngineProps) {
  const { mission } = useMission();
  const suppliers = mission.discoveredSuppliers;

  const breakdowns = useMemo(() => {
    return suppliers.map(sup => ({
      supplier: sup,
      breakdown: calculateTrueCost(sup),
    }));
  }, [suppliers]);

  return (
    <div className="min-h-full flex flex-col pt-12 pb-24 px-8 md:px-16 lg:px-24">
      
      {/* Header */}
      <div className="w-full flex-shrink-0 z-20 mb-16">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <p className="label-meta text-[#969AA6] mb-4">PHASE 04 // TRUE COST MODEL</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-[#181922] mb-4">
            Financial Synthesis
          </h1>
          <p className="font-sans font-light text-[#7A7F8D] text-lg max-w-2xl">
            Only components with verifiable evidence are quantified. Missing data is labeled, never hallucinated.
          </p>
        </motion.div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-16">
        {breakdowns.map(({ supplier: sup, breakdown: bd }, i) => (
          <motion.div 
            key={sup.id} 
            className="surface-evidence p-8 md:p-12 relative group"
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Dossier tag */}
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="bg-[#181922] text-white text-[8px] font-mono tracking-[0.2em] px-3 py-2 uppercase rounded-md shadow-md">
                Dossier #{String(i+1).padStart(2,'0')}
              </span>
            </div>

            <div className="flex flex-col mb-10 border-b border-[#181922]/10 pb-8">
              <h3 className="font-display text-3xl text-[#181922] mb-2">{sup.name.value || 'Unknown Entity'}</h3>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#969AA6] tracking-[0.2em] uppercase">Base Assessment</span>
                <span className="text-[9px] font-mono tracking-widest uppercase border border-[#181922]/15 text-[#7A7F8D] px-2 py-1 rounded">
                  {bd.quotedSubtotal?.label || 'calculated'}
                </span>
              </div>
            </div>

            {/* Cost Ledger */}
            <div className="space-y-4 mb-10">
              {bd.quotedSubtotal && (
                <div className="flex justify-between items-end pb-2 border-b border-[#181922]/5">
                  <span className="text-[#555867] font-sans text-sm">Listed Price</span>
                  <div className="flex flex-col items-end">
                    <span className="text-[#181922] font-mono text-lg">&#8377;{bd.quotedSubtotal.value.toLocaleString('en-IN')}</span>
                    <span className="text-[7px] font-mono text-[#969AA6] tracking-widest">{bd.quotedSubtotal.label.toUpperCase()}</span>
                  </div>
                </div>
              )}
              {bd.shipping && (
                <div className="flex justify-between items-end pb-2 border-b border-[#181922]/5">
                  <span className="text-[#555867] font-sans text-sm">Logistics / Shipping</span>
                  <span className="text-[#181922] font-mono text-lg">&#8377;{bd.shipping.value.toLocaleString('en-IN')}</span>
                </div>
              )}
              {bd.tax && (
                <div className="flex justify-between items-end pb-2 border-b border-[#181922]/5">
                  <span className="text-[#555867] font-sans text-sm">Estimated Liability (Tax)</span>
                  <div className="flex flex-col items-end">
                    <span className="text-[#181922] font-mono text-lg">&#8377;{bd.tax.value.toLocaleString('en-IN')}</span>
                    <span className="text-[7px] font-mono text-[#969AA6] tracking-widest">{bd.tax.label.toUpperCase()}</span>
                  </div>
                </div>
              )}

              {/* Unquantified risk variables */}
              {bd.componentsNotQuantified.length > 0 && (
                <div className="pt-4 space-y-3">
                  <span className="block text-[9px] font-mono text-[#FF5FA2] tracking-[0.2em] uppercase mb-2">Unquantified Variables</span>
                  {bd.componentsNotQuantified.map(comp => (
                    <div key={comp} className="flex justify-between items-center text-sm">
                      <span className="text-[#7A7F8D] font-sans">{comp}</span>
                      <span className="text-[9px] font-mono text-[#969AA6] tracking-widest border border-[#181922]/10 px-2 py-0.5 rounded">PENDING</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total — white card with aurora accent */}
            <div className="bg-[#FBFBF8] border border-[#181922]/10 rounded-xl p-6 -mx-4 md:-mx-6 mt-8 flex justify-between items-center">
              <div>
                <span className="block font-sans font-light text-[#7A7F8D] text-xs mb-1">True Cost Estimate</span>
                <span className="block text-[9px] font-mono text-[#969AA6] tracking-widest">
                  {bd.componentsIncluded} / {bd.componentsIncluded + bd.componentsNotQuantified.length} TRACEABLE
                </span>
              </div>
              <span className="font-mono text-3xl text-[#6C63FF] font-bold">
                {bd.estimatedTotal > 0 ? `₹${bd.estimatedTotal.toLocaleString('en-IN')}` : 'N/A'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {suppliers.length === 0 && (
        <div className="surface-panel p-12 text-center my-8 max-w-xl rounded-xl">
          <p className="font-sans font-light text-[#7A7F8D]">No entities present for modeling.</p>
        </div>
      )}

      <motion.div 
        className="border-t border-[#181922]/6 pt-12 flex"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
      >
        <button onClick={onNext} className="editorial-btn editorial-btn-primary rounded-full px-8 py-3">
          <span className="tracking-widest text-[11px] uppercase font-bold">Construct Evidence Map</span>
          <span className="font-mono text-xs opacity-70 ml-2">&rarr;</span>
        </button>
      </motion.div>

    </div>
  );
}
