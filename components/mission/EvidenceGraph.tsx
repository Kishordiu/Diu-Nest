'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useMission } from '@/lib/mission-context';

interface EvidenceGraphProps { onNext: () => void; }

export default function EvidenceGraph({ onNext }: EvidenceGraphProps) {
  const { mission } = useMission();
  const suppliers = mission.discoveredSuppliers;

  const evidenceNodes = suppliers.flatMap(sup => {
    const nodes: { claim: string; source: string; url: string; status: string; field: string; supplier: string }[] = [];
    
    if (sup.name.value) nodes.push({ claim: `Entity Identity: ${sup.name.value}`, source: sup.sources[0]?.domain || 'unknown', url: sup.sources[0]?.url || '', status: sup.name.status, field: 'identity', supplier: sup.name.value });
    if (sup.certifications.value?.length) nodes.push({ claim: `Certifications: ${sup.certifications.value.join(', ')}`, source: sup.sources[0]?.domain || '', url: sup.sources[0]?.url || '', status: sup.certifications.status, field: 'certification', supplier: sup.name.value || '' });
    if (sup.listings[0]?.price?.value) nodes.push({ claim: `Live Pricing: $${sup.listings[0].price.value.toLocaleString()}`, source: sup.listings[0].source?.domain || '', url: sup.listings[0].source?.url || '', status: sup.listings[0].price.status, field: 'price', supplier: sup.name.value || '' });
    if (sup.location.value) nodes.push({ claim: `Location: ${sup.location.value}`, source: sup.sources[0]?.domain || '', url: sup.sources[0]?.url || '', status: sup.location.status, field: 'location', supplier: sup.name.value || '' });
    if (sup.supplierType.value) nodes.push({ claim: `Classification: ${sup.supplierType.value}`, source: sup.sources[0]?.domain || '', url: sup.sources[0]?.url || '', status: sup.supplierType.status, field: 'type', supplier: sup.name.value || '' });

    return nodes;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#22C55E';
      case 'supported': return '#22C55E';
      case 'self-declared': return '#FFB86B';
      case 'conflict': return '#FF5FA2';
      default: return '#969AA6';
    }
  };

  return (
    <div className="min-h-full flex flex-col pt-12 pb-24 px-8 md:px-16 lg:px-24 relative overflow-hidden bg-base">
      
      {/* Extremely minimal background layout lines */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-40">
        <svg width="100%" height="100%" className="opacity-20 absolute inset-0">
          <line x1="10%" y1="0" x2="10%" y2="100%" stroke="rgba(24,25,34,0.15)" strokeWidth="1" strokeDasharray="4 8" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(24,25,34,0.15)" strokeWidth="1" strokeDasharray="4 8" />
          <line x1="90%" y1="0" x2="90%" y2="100%" stroke="rgba(24,25,34,0.15)" strokeWidth="1" strokeDasharray="4 8" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(24,25,34,0.15)" strokeWidth="1" strokeDasharray="4 8" />
        </svg>
      </div>

      {/* Header */}
      <div className="w-full flex-shrink-0 z-20 mb-20">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <p className="label-meta text-aurora-1 mb-4">PHASE 05 // PROVENANCE TRACING</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-text mb-4">
            Evidence Topology
          </h1>
          <p className="font-sans text-text/60 text-lg md:text-xl max-w-2xl">
            {evidenceNodes.length} discrete data points traced to original source material. No opaque reasoning.
          </p>
        </motion.div>
      </div>

      {/* Evidence Ledger - Large typography, crisp borders */}
      <div className="w-full max-w-6xl z-10 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {evidenceNodes.map((node, i) => {
            const color = getStatusColor(node.status);
            return (
              <motion.div 
                key={`${node.supplier}-${node.field}-${i}`}
                className="diu-card bg-white p-8 md:p-10 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="text-[10px] font-mono tracking-widest text-text/40 uppercase">{node.supplier}</div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-text/5 rounded-full">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-text/80">{node.status}</span>
                  </div>
                </div>

                <div className="font-display text-2xl md:text-3xl font-semibold text-text mb-10 leading-tight border-b border-text/10 pb-10">
                  {node.claim}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-mono tracking-widest text-text/40 uppercase">Origin Source</span>
                  {node.url ? (
                    <a href={node.url} target="_blank" rel="noopener noreferrer" 
                      className="text-xs font-mono font-medium text-text/60 hover:text-text transition-colors flex items-center gap-2 border border-text/10 px-4 py-2 rounded">
                      {node.source} <span className="opacity-50">&nearr;</span>
                    </a>
                  ) : (
                    <span className="text-xs font-mono text-text/40">No direct link</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {evidenceNodes.length === 0 && (
          <div className="diu-card p-12 text-center max-w-xl mx-auto rounded-xl mt-12">
            <p className="font-sans font-medium text-lg text-text/50">Run supplier discovery to populate evidence data.</p>
          </div>
        )}
      </div>

      <motion.div 
        className="mt-16 border-t border-text/10 pt-10 flex justify-end z-10"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
      >
        <button onClick={onNext} className="btn-signature">
          <span>RUN DECISION ENGINE</span>
        </button>
      </motion.div>
    </div>
  );
}
