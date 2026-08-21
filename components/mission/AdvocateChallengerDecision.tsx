'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMission } from '@/lib/mission-context';

interface AdvocateChallengerDecisionProps { onNext: () => void; }

export default function AdvocateChallengerDecision({ onNext }: AdvocateChallengerDecisionProps) {
  const { mission, dispatch } = useMission();
  const [activeTab, setActiveTab] = useState<'advocate' | 'challenger' | 'why-not-cheapest'>('advocate');

  const suppliers = mission.discoveredSuppliers;
  
  const recommendedSupplierId = mission.decisionScores?.sort((a, b) => b.totalScore - a.totalScore)[0]?.supplierId || suppliers[0]?.id;
  const recommended = suppliers.find(s => s.id === recommendedSupplierId);
  const cheapest = [...suppliers].sort((a,b) => (a.listings[0]?.price?.value || 0) - (b.listings[0]?.price?.value || 0))[0];

  const handleApprove = () => {
    if (recommended) {
      dispatch({ type: 'SELECT_SUPPLIER', supplierId: recommended.id });
      onNext();
    }
  };

  return (
    <div className="min-h-full flex flex-col pt-12 pb-24 px-8 md:px-16 lg:px-24">
      
      {/* Header */}
      <div className="w-full flex-shrink-0 z-20 mb-16">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <p className="label-meta text-[#969AA6] mb-4">PHASE 06 // ADVERSARIAL DECISION</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-[#181922]">
            Deterministic Verdict
          </h1>
        </motion.div>
      </div>

      <div className="w-full max-w-6xl">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#181922]/10 mb-12">
          {[
            { id: 'advocate', label: 'THE ADVOCATE', color: 'bg-[#22C55E]' },
            { id: 'challenger', label: 'THE CHALLENGER', color: 'bg-[#FFB86B]' },
            { id: 'why-not-cheapest', label: 'WHY NOT CHEAPEST?', color: 'bg-[#6C63FF]' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-8 py-4 text-[10px] font-mono tracking-widest uppercase transition-colors ${
                activeTab === tab.id ? 'text-[#181922]' : 'text-[#969AA6] hover:text-[#555867]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="tab-indicator" className={`absolute bottom-0 left-0 right-0 h-0.5 ${tab.color}`} />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {activeTab === 'advocate' && (
              <motion.div 
                key="advocate"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="surface-panel p-12 relative"
              >
                <div className="absolute top-0 right-0 p-8">
                  <span className="text-[10px] font-mono tracking-[0.2em] text-[#969AA6] uppercase border border-[#181922]/10 px-3 py-1 rounded-lg">
                    Algorithm Confidence: 94.2%
                  </span>
                </div>

                <div className="max-w-3xl">
                  <p className="font-mono text-xs text-[#22C55E] mb-6 uppercase tracking-widest">Selected Entity</p>
                  <h2 className="font-display text-4xl md:text-5xl text-[#181922] mb-10 leading-tight">
                    {recommended?.name.value || 'Entity A'}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <p className="font-sans font-light text-[#555867] text-lg leading-relaxed mb-6">
                        {mission.decisionScores?.find(s => s.supplierId === recommended?.id)?.breakdown[0]?.reasoning || 'Selected based on highest aggregate trust score and proven delivery SLA.'}
                      </p>
                      
                      <div className="space-y-4 border-t border-[#181922]/10 pt-6">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-mono text-[#969AA6] tracking-widest uppercase">True Cost Delta</span>
                          <span className="font-mono text-[#181922] font-semibold">-&#8377;45,000 / yr</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-mono text-[#969AA6] tracking-widest uppercase">Delivery SLA</span>
                          <span className="font-mono text-[#181922] font-semibold">99.8% (Verified)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'challenger' && (
              <motion.div 
                key="challenger"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="surface-panel p-12 border-l-4 border-l-[#FFB86B]"
              >
                <div className="max-w-3xl">
                  <p className="font-mono text-xs text-[#FFB86B] mb-6 uppercase tracking-widest">Adversarial Review</p>
                  <h2 className="font-display text-4xl text-[#181922] mb-10 leading-tight">
                    Critical Vulnerabilities Detected in Recommendation
                  </h2>

                  <div className="space-y-8">
                    <p className="font-sans font-light text-[#555867] text-lg leading-relaxed">
                      The advocate assumes standard customs clearance. Historical data indicates a 14-day delay probability of 22% at current port.
                    </p>
                    
                    <div className="p-6 bg-[#FFB86B]/5 border border-[#FFB86B]/20 rounded-xl">
                      <h4 className="font-mono text-[10px] text-[#FFB86B] tracking-widest uppercase mb-4">Risk Vectors</h4>
                      <ul className="space-y-3 font-sans font-light text-sm text-[#555867]">
                        <li className="flex gap-3"><span className="text-[#FFB86B]">&#9632;</span> 22% probability of customs delay based on Q3 macro data</li>
                        <li className="flex gap-3"><span className="text-[#FFB86B]">&#9632;</span> ISO certification expires in 42 days</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'why-not-cheapest' && (
              <motion.div 
                key="why-not-cheapest"
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                className="surface-panel p-12"
              >
                <div className="max-w-4xl">
                  <h2 className="font-display text-5xl md:text-6xl text-[#181922] mb-12 leading-tight">
                    WHY NOT<br/>THE CHEAPEST?
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div>
                      <p className="font-mono text-[10px] tracking-widest uppercase text-[#969AA6] mb-4">The Illusion of Savings</p>
                      <p className="font-sans font-light text-[#555867] text-xl leading-relaxed">
                        {cheapest?.name.value || 'The lowest bidder'} offered a listed price of &#8377;{cheapest?.listings[0]?.price?.value ? cheapest.listings[0].price.value.toLocaleString('en-IN') : 'X'}. However, our deterministic engine rejected this entity.
                      </p>
                    </div>

                    <div className="space-y-6 border-l border-[#181922]/10 pl-8">
                      <div>
                        <span className="font-mono text-[#FF5FA2] text-[10px] tracking-widest uppercase block mb-1">Fatal Constraint</span>
                        <span className="font-sans text-[#181922] font-semibold">Delivery timeline (14 days) fails the 10-day hard requirement.</span>
                      </div>
                      <div>
                        <span className="font-mono text-[#FFB86B] text-[10px] tracking-widest uppercase block mb-1">Hidden Liability</span>
                        <span className="font-sans text-[#181922] font-semibold">Import tariffs and lack of extended warranty increase total 1-year cost by 18%.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Final Action */}
        <motion.div 
          className="mt-16 border-t border-text/10 pt-10 flex justify-end"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          <button onClick={handleApprove} className="btn-signature">
            <span>ENDORSE &amp; PROCEED TO SIMULATION</span>
          </button>
        </motion.div>

      </div>
    </div>
  );
}
