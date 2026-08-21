'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMission } from '@/lib/mission-context';
import { SourceBadge } from '@/components/ui/RealDataUI';

interface QuoteComparisonProps { onNext: () => void; }

export default function QuoteComparison({ onNext }: QuoteComparisonProps) {
  const { mission } = useMission();
  const suppliers = mission.discoveredSuppliers;
  const marketRange = mission.marketRange;
  
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="min-h-full flex flex-col pt-12 pb-24 px-8 md:px-16 lg:px-24 bg-base overflow-hidden relative">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-aurora-3 blur-[120px] opacity-10 rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-aurora-5 blur-[100px] opacity-10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="w-full flex-shrink-0 z-20 mb-16 relative">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <p className="label-meta text-aurora-3 mb-4">PHASE 03 // QUOTATION INGESTION</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-text">
            Physical Quote Wall
          </h1>
          <p className="font-sans text-text/60 text-lg md:text-xl mt-4 max-w-2xl">
            Live market listings and extracted quotation documents assembled for parallel comparison.
          </p>
        </motion.div>
      </div>

      <div className="w-full max-w-7xl relative z-10">
        
        {/* Quote Wall Grid / Masonry-ish */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-16 perspective-[1500px]">
          {suppliers.map((sup, i) => {
            const price = sup.listings[0]?.price?.value;
            const isAnomaly = marketRange && price && Math.abs((price - marketRange.median) / marketRange.median) > 0.3;
            const isExpanded = expandedId === sup.id;
            
            // Randomize slight rotation for physical paper effect, unless expanded
            const rotateZ = isExpanded ? 0 : (i % 2 === 0 ? -2 : 3);

            return (
              <motion.div 
                key={sup.id}
                layout
                onClick={() => setExpandedId(isExpanded ? null : sup.id)}
                className={`relative cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isExpanded ? 'col-span-1 md:col-span-2 lg:col-span-3 min-h-[500px] z-30' : 'z-10'}`}
                initial={{ opacity: 0, y: 50, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0, rotateZ }}
                whileHover={!isExpanded ? { scale: 1.02, rotateZ: 0, zIndex: 20 } : {}}
              >
                {/* Physical Paper Card */}
                <div className={`w-full h-full bg-white transition-shadow duration-500 ${isExpanded ? 'shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] rounded-xl border border-text/10' : 'shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-lg border border-text/5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]'}`}>
                  
                  {/* Paper Header (Fold effect) */}
                  <div className="h-6 w-full bg-gradient-to-b from-text/5 to-transparent border-b border-text/5 flex items-center justify-between px-6">
                    <span className="text-[10px] font-mono tracking-widest text-text/40 uppercase">QUOTE_{sup.id.substring(0, 6)}</span>
                  </div>
                  
                  <div className="p-8 md:p-10">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h3 className="font-serif italic text-3xl font-bold text-text mb-3">
                          {sup.name.value}
                        </h3>
                        <div className="flex gap-2">
                          <SourceBadge label="live-web" />
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono tracking-widest text-text/40 block mb-2 uppercase">Total Quoted</span>
                        <span className="font-mono text-3xl font-bold text-text">
                          ${price ? price.toLocaleString() : '---'}
                        </span>
                        {isAnomaly && (
                          <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="mt-3 text-[10px] font-mono tracking-widest bg-critical-red text-white px-3 py-1.5 uppercase font-bold inline-block"
                          >
                            ANOMALY
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Paper Body */}
                    <div className="space-y-8 relative">
                      <div className="grid grid-cols-2 gap-6 border-t border-b border-text/10 py-8">
                          <div>
                            <span className="block text-[10px] font-mono text-text/40 tracking-widest uppercase mb-2">Availability</span>
                            <span className="font-sans font-semibold text-lg text-text">{sup.listings[0]?.availability?.value || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-mono text-text/40 tracking-widest uppercase mb-2">Warranty</span>
                            <span className="font-sans text-base font-semibold text-text/70">Standard</span>
                          </div>
                      </div>
                      
                      {isExpanded && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-10"
                        >
                          <div>
                            <span className="block text-[10px] font-mono text-text/50 tracking-widest uppercase mb-4">Extracted Line Items</span>
                            <div className="bg-[#FBFBF8] p-6 font-mono text-base text-text/80 leading-relaxed border border-text/10 shadow-inner">
                              <div className="flex justify-between border-b border-text/10 pb-3 mb-3">
                                <span>Unit Price</span>
                                <span>${Math.round((price || 0)/500).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between border-b border-text/10 pb-3 mb-3">
                                <span>Quantity</span>
                                <span>500</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>Included</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className="block text-[10px] font-mono text-text/50 tracking-widest uppercase mb-4">Document Trace</span>
                            <div className="w-full h-40 bg-[#FBFBF8] flex items-center justify-center border border-text/10 shadow-inner">
                              <span className="font-sans text-sm text-text/40 italic">PDF Source Preview Unavailable</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          className="mt-12 flex justify-end pt-8 border-t border-text/10"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          <button onClick={onNext} className="btn-signature">
            <span>CALCULATE TRUE COST</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
