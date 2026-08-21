'use client';
import React, { useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import type { DiscoveredSupplier } from '../../lib/types';
import { SourceBadge, DataConfidence, StatusLabel } from './RealDataUI';

interface SupplierCardProps {
  supplier: DiscoveredSupplier;
  selected?: boolean;
  recommended?: boolean;
  onClick?: () => void;
}

export function SupplierCard({ supplier, selected, recommended, onClick }: SupplierCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useSpring(0, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 50 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-4, 4]);

  const price = supplier.listings[0]?.price?.value;
  const riskLevel = supplier.riskSignals.some(r => r.severity === 'high') ? 'high' :
    supplier.riskSignals.some(r => r.severity === 'medium') ? 'medium' : 'low';

  return (
    <motion.div
      ref={cardRef}
      className={`relative crystal-panel p-6 cursor-pointer transition-all duration-300 ${
        selected ? 'border-[#39FF88]/60 shadow-[0_0_20px_rgba(57,255,136,0.15)]' : ''
      }`}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); mouseX.set(0); mouseY.set(0); }}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
    >
      {/* Top accent */}
      <div className={`absolute top-0 left-0 w-full h-0.5 ${
        recommended ? 'bg-[#39FF88]' : riskLevel === 'high' ? 'bg-red-500' : riskLevel === 'medium' ? 'bg-amber-500' : 'bg-white/10'
      }`} />

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-mono text-white font-medium">{supplier.name.value || 'Unknown'}</h3>
          {supplier.location.value && (
            <span className="text-[10px] text-white/40 font-mono">{supplier.location.value}</span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {recommended && (
            <span className="text-[8px] tracking-[0.2em] font-mono bg-[#39FF88]/10 text-[#39FF88] px-2 py-0.5 border border-[#39FF88]/30">
              RECOMMENDED
            </span>
          )}
          <StatusLabel status={supplier.name.status} />
        </div>
      </div>

      {/* Type badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-[8px] tracking-[0.15em] font-mono px-1.5 py-0.5 border ${
          supplier.supplierType.value === 'manufacturer' ? 'border-[#39FF88]/30 text-[#39FF88]' :
          supplier.supplierType.value === 'distributor' ? 'border-blue-400/30 text-blue-400' :
          'border-white/20 text-white/50'
        }`}>
          {(supplier.supplierType.value || 'UNKNOWN').toUpperCase()}
        </span>
        <SourceBadge label="live-web" timestamp={supplier.lastRetrieved} />
      </div>

      {/* Price */}
      <div className="mb-4">
        {price ? (
          <div>
            <div className="text-[9px] font-mono text-white/30 tracking-wider mb-1">MARKET LISTING</div>
            <div className="text-xl font-mono text-[#39FF88]">
              ₹{price.toLocaleString('en-IN')}
            </div>
          </div>
        ) : (
          <div className="text-sm font-mono text-white/30">Contact supplier for pricing</div>
        )}
      </div>

      {/* Certifications */}
      {supplier.certifications.value && supplier.certifications.value.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {supplier.certifications.value.map((cert, i) => (
            <span key={i} className="text-[8px] font-mono text-white/50 bg-white/5 px-1.5 py-0.5">{cert}</span>
          ))}
        </div>
      )}

      {/* Data confidence */}
      <DataConfidence confidence={supplier.dataConfidence} />

      {/* Risk signals */}
      {supplier.riskSignals.length > 0 && (
        <div className="mt-3 text-[9px] font-mono text-white/30">
          {supplier.riskSignals.length} risk signal{supplier.riskSignals.length !== 1 ? 's' : ''} ·{' '}
          {supplier.riskSignals.filter(r => r.severity === 'high').length} high
        </div>
      )}

      {/* Source link */}
      {supplier.website.value && (
        <a href={supplier.website.value} target="_blank" rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-[10px] font-mono text-[#39FF88]/60 hover:text-[#39FF88] transition-colors"
          onClick={e => e.stopPropagation()}>
          VIEW SOURCE ↗
        </a>
      )}
    </motion.div>
  );
}
