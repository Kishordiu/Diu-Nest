'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMission } from '@/lib/mission-context';
import { SourceBadge } from '@/components/ui/RealDataUI';

interface DigitalTwinProps { onNext: () => void; }

export default function DigitalTwin({ onNext }: DigitalTwinProps) {
  const { mission } = useMission();
  const [activeNode, setActiveNode] = useState(0);

  const supplier = mission.discoveredSuppliers.find(s => s.id === mission.selectedSupplierId) 
    || mission.discoveredSuppliers[0];

  const nodes = [
    { id: 'manufacturing', label: 'Manufacturing Facility', location: supplier?.location.value || 'Unknown HQ', status: 'optimal', delay: 0 },
    { id: 'qa', label: 'QA Testing', location: 'On-site', status: 'warning', delay: 2 },
    { id: 'customs', label: 'Export Customs', location: 'Port of Origin', status: 'optimal', delay: 0 },
    { id: 'transit', label: 'Air Freight Transit', location: 'International', status: 'optimal', delay: 0 },
    { id: 'import', label: 'Import Customs', location: 'Destination Port', status: 'critical', delay: 5 },
    { id: 'delivery', label: 'Last Mile Delivery', location: (typeof mission.requirement?.location === 'string' ? mission.requirement.location : mission.requirement?.location?.value) || 'Destination', status: 'optimal', delay: 0 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode(prev => (prev + 1) % nodes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [nodes.length]);

  return (
    <div className="min-h-full flex flex-col pt-12 pb-24 px-12 md:px-24">
      
      {/* Header */}
      <div className="w-full flex-shrink-0 z-20 mb-16">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <p className="label-meta text-[#969AA6] mb-4">PHASE 08 // LOGISTICS TOPOLOGY</p>
          <h1 className="font-display text-4xl md:text-5xl font-normal tracking-wider text-[#181922]">
            DIGITAL TWIN
          </h1>
        </motion.div>
      </div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-12">
        
        {/* Map / Topology Visualization */}
        <div className="lg:w-2/3 surface-panel p-8 md:p-12 min-h-[500px] relative overflow-hidden flex items-center justify-center">
          
          {/* Architectural Background Grid */}
          <div 
            className="absolute inset-0 border border-[#181922]/6 pointer-events-none" 
            style={{ 
              backgroundImage: 'linear-gradient(rgba(24,25,34,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(24,25,34,0.04) 1px, transparent 1px)', 
              backgroundSize: '40px 40px' 
            }} 
          />

          <div className="relative w-full max-w-md h-[400px]">
            {nodes.map((node, i) => {
              const isActive = i === activeNode;
              const isPast = i < activeNode;
              
              // Simple snake layout
              const x = (i % 2 === 0) ? 20 : 80;
              const y = (i * 20) + 10;

              return (
                <React.Fragment key={node.id}>
                  {/* Connecting Line */}
                  {i < nodes.length - 1 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
                      <motion.line 
                        x1={`${x}%`} y1={`${y}%`} 
                        x2={`${(i+1) % 2 === 0 ? 20 : 80}%`} y2={`${((i+1) * 20) + 10}%`}
                        stroke={isPast ? 'rgba(24,25,34,0.35)' : 'rgba(24,25,34,0.1)'} 
                        strokeWidth="1"
                        strokeDasharray={isActive ? "4 4" : "none"}
                      />
                    </svg>
                  )}

                  {/* Node */}
                  <motion.div 
                    className="absolute flex items-center gap-4 z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                  >
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-sm border ${isActive ? 'bg-[#6C63FF] border-[#6C63FF]' : isPast ? 'bg-[#181922]/40 border-transparent' : 'border-[#181922]/30 bg-transparent'}`} />
                      {isActive && (
                        <motion.div 
                          className="absolute -inset-1 border border-[#6C63FF] rounded-sm"
                          animate={{ scale: [1, 1.8], opacity: [1, 0] }} 
                          transition={{ repeat: Infinity, duration: 1.5 }} 
                        />
                      )}
                    </div>
                    
                    <div className={`transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                      <span className="block font-mono text-[9px] tracking-widest uppercase mb-1 text-[#7A7F8D]">{node.location}</span>
                      <span className="block font-sans text-sm whitespace-nowrap text-[#181922] font-medium">{node.label}</span>
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Telemetry Sidebar */}
        <div className="lg:w-1/3 space-y-6">
          <div className="surface-panel p-8">
            <h3 className="font-mono text-[9px] tracking-[0.2em] text-[#969AA6] uppercase mb-8">Live Telemetry</h3>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeNode}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <span className="font-mono text-[9px] text-[#969AA6] tracking-widest block uppercase mb-1">Current Focus</span>
                  <span className="font-display text-xl text-[#181922] font-medium">{nodes[activeNode].label}</span>
                </div>

                <div className="pt-4 border-t border-[#181922]/10">
                  <span className="font-mono text-[9px] text-[#969AA6] tracking-widest block uppercase mb-1">Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: nodes[activeNode].status === 'optimal' ? '#22C55E' : nodes[activeNode].status === 'warning' ? '#FFB86B' : '#FF5FA2' }} />
                    <span className="font-mono text-sm uppercase font-semibold" style={{ color: nodes[activeNode].status === 'optimal' ? '#22C55E' : nodes[activeNode].status === 'warning' ? '#FFB86B' : '#FF5FA2' }}>
                      {nodes[activeNode].status}
                    </span>
                  </div>
                </div>

                {nodes[activeNode].delay > 0 && (
                  <div className="p-4 bg-[#FF5FA2]/10 border-l-2 border-[#FF5FA2] rounded-r-xl">
                    <span className="block font-sans text-sm text-[#FF5FA2] font-medium mb-1">Historical Delay Detected</span>
                    <span className="font-mono text-[10px] text-[#FF5FA2]/80 tracking-widest uppercase">Avg +{nodes[activeNode].delay} Days</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="surface-panel p-8">
            <span className="block font-mono text-[9px] text-[#969AA6] tracking-widest uppercase mb-4">Total SLA Projection</span>
            <span className="font-display text-3xl text-[#181922] font-medium">14 Days</span>
            <span className="block font-sans font-light text-[#7A7F8D] text-xs mt-2">Includes predicted customs buffer</span>
          </div>
        </div>

      </div>

      <motion.div 
        className="mt-16 border-t border-text/10 pt-12 flex justify-end"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
      >
        <button onClick={onNext} className="btn-signature">
          <span>RUN FIREWALL DIAGNOSTICS</span>
        </button>
      </motion.div>

    </div>
  );
}
