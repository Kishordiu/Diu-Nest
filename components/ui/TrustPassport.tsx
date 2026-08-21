'use client';
import React from 'react';
import { motion } from 'framer-motion';
import type { DiscoveredSupplier } from '../../lib/types';
import { GlassPanel } from './GlassPanel';
import { SourceBadge, StatusLabel, DataConfidence } from './RealDataUI';

interface TrustPassportProps {
  supplier: DiscoveredSupplier;
}

export function TrustPassport({ supplier }: TrustPassportProps) {
  const certs = supplier.certifications.value || [];

  return (
    <GlassPanel className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-mono text-white font-medium">{supplier.name.value || 'Unknown'}</h3>
          <p className="text-xs text-white/40 font-mono">{supplier.location.value || 'Location not verified'}</p>
        </div>
        <StatusLabel status={supplier.name.status} />
      </div>

      {/* Data Confidence — NOT trust score */}
      <DataConfidence confidence={supplier.dataConfidence} label="DATA COMPLETENESS" />

      {/* Source info */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-white/40">
          {supplier.sourceCount} source{supplier.sourceCount !== 1 ? 's' : ''} · Identity {supplier.identityConfidence}%
        </div>
        <SourceBadge label={supplier.freshnessStatus === 'live' ? 'live-web' : 'cached-web'} timestamp={supplier.lastRetrieved} />
      </div>

      {/* Certifications */}
      {certs.length > 0 ? (
        <div>
          <div className="text-[9px] tracking-[0.2em] font-mono text-white/30 mb-2">CERTIFICATIONS FOUND</div>
          <div className="flex flex-wrap gap-2">
            {certs.map((cert, i) => (
              <motion.div key={i} className="flex items-center gap-1.5 bg-white/5 px-2 py-1"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  supplier.certifications.status === 'verified' ? 'bg-[#39FF88]' : 'bg-amber-400'
                }`} />
                <span className="text-[10px] font-mono text-white/70">{cert}</span>
              </motion.div>
            ))}
          </div>
          <div className="text-[8px] font-mono text-white/20 mt-1">
            Status: {supplier.certifications.status}
          </div>
        </div>
      ) : (
        <div>
          <div className="text-[9px] tracking-[0.2em] font-mono text-white/30 mb-1">CERTIFICATIONS</div>
          <p className="text-xs font-mono text-white/20">No certifications found in available sources</p>
        </div>
      )}

      {/* Risk signals */}
      {supplier.riskSignals.length > 0 && (
        <div>
          <div className="text-[9px] tracking-[0.2em] font-mono text-white/30 mb-2">RISK SIGNALS</div>
          {supplier.riskSignals.slice(0, 3).map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-white/40 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full ${
                r.severity === 'high' ? 'bg-red-400' : r.severity === 'medium' ? 'bg-amber-400' : 'bg-white/30'
              }`} />
              {r.title}
            </div>
          ))}
        </div>
      )}

      {/* Source link */}
      {supplier.website.value && (
        <a href={supplier.website.value} target="_blank" rel="noopener noreferrer"
          className="text-[10px] font-mono text-[#39FF88]/60 hover:text-[#39FF88] transition-colors">
          View source ↗
        </a>
      )}
    </GlassPanel>
  );
}
