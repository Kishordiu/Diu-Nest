'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useMission } from '@/lib/mission-context';
import { StatusLabel, DataConfidence } from '@/components/ui/RealDataUI';

interface SupplierDiscoveryProps { onNext: () => void; }

// Fallback images based on type if no image is available
const getFallbackImage = (type: string) => {
  if (type === 'manufacturer') return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800';
  if (type === 'distributor') return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800';
  return 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800';
};

export default function SupplierDiscovery({ onNext }: SupplierDiscoveryProps) {
  const { mission, discoverSuppliers, isLoading, error } = useMission();
  const [hasSearched, setHasSearched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasSearched && mission.rawInput && mission.discoveredSuppliers.length === 0) {
      setHasSearched(true);
      discoverSuppliers();
    }
  }, [hasSearched, mission.rawInput, mission.discoveredSuppliers.length, discoverSuppliers]);

  const suppliers = mission.discoveredSuppliers;

  return (
    <div className="min-h-full flex flex-col relative w-full h-full pb-24 overflow-hidden pt-8 md:pt-12">

      {/* Header overlay */}
      <div className="w-full flex-shrink-0 z-20 px-8 md:px-16 lg:px-24 mb-4">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <p className="label-meta text-aurora-2 mb-2">PHASE 02 // DISCOVERY</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-text">
            SUPPLY NETWORK
          </h1>
        </motion.div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8">
          <motion.div
            className="w-20 h-20 border-2 border-text/10 border-t-aurora-2 rounded-full mb-8 animate-spin"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          />
          <motion.h2
            className="font-display text-3xl font-bold text-text mb-4"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            SCANNING LIVE NETWORK
          </motion.h2>
          <motion.p
            className="font-mono text-sm text-text/50 uppercase tracking-widest"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          >
            Accessing primary intelligence sources...
          </motion.p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex-1 flex items-center justify-center p-8 relative z-10">
          <div className="text-center max-w-lg">
            <h2 className="font-display text-3xl font-bold text-critical-red mb-4">NETWORK ERROR</h2>
            <p className="font-sans text-xl text-text/60 mb-8 leading-relaxed">{error}</p>
            <button onClick={() => discoverSuppliers(true)} className="btn-secondary">
              Retry Scan
            </button>
          </div>
        </div>
      )}

      {/* Spatial Atlas Slider */}
      {!isLoading && suppliers.length > 0 && (
        <div className="relative flex-1 w-full flex items-center min-h-[600px] mt-8">

          {/* Scrollable track */}
          <motion.div
            ref={containerRef}
            drag="x"
            dragConstraints={{ left: -((suppliers.length - 1) * 500), right: 0 }}
            className="absolute inset-0 flex items-center overflow-visible px-8 md:px-24 pb-12 pt-4 cursor-grab active:cursor-grabbing"
          >
            <div className="flex gap-10 min-w-max h-full items-center">
              {suppliers.map((sup, i) => {
                const typeColor = sup.supplierType.value === 'manufacturer' ? '#6C63FF' :
                  sup.supplierType.value === 'distributor' ? '#8B5CF6' : '#FFB86B';

                return (
                  <motion.div
                    key={sup.id}
                    className="relative w-[340px] md:w-[480px] h-[600px] shrink-0 group"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 60, damping: 20, delay: i * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    {/* The Dossier Card */}
                    <div className="absolute inset-0 diu-card overflow-hidden flex flex-col bg-white">

                      {/* Image header - Takes up 50% */}
                      <div className="h-1/2 w-full relative shrink-0 overflow-hidden bg-text/5">
                        <img
                          src={getFallbackImage(sup.supplierType.value || '')}
                          alt={sup.name.value || ''}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-text/60 to-transparent mix-blend-multiply opacity-50" />

                        <div className="absolute bottom-4 left-6 flex items-center gap-2 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: typeColor }} />
                          <span className="text-[10px] font-mono tracking-widest text-text font-bold uppercase">
                            {sup.supplierType.value || 'Entity'}
                          </span>
                        </div>
                        <div className="absolute top-4 right-4 z-10">
                          <StatusLabel status={sup.name.status} />
                        </div>
                      </div>

                      <div className="flex-1 p-8 flex flex-col justify-between">
                        {/* Identity */}
                        <div>
                          <h3 className="font-display text-3xl font-bold text-text mb-2 leading-tight">
                            {sup.name.value || 'Unknown Identity'}
                          </h3>
                          {sup.location.value && (
                            <div className="font-sans text-sm font-semibold text-text/50 mb-6 uppercase tracking-wider">
                              {sup.location.value}
                            </div>
                          )}

                          <div>
                            <span className="block text-[10px] font-mono text-text/40 tracking-widest mb-2 uppercase">Certifications</span>
                            <span className="block font-sans text-base font-medium text-text/80">
                              {sup.certifications.value?.join(' • ') || 'None Verified'}
                            </span>
                          </div>
                        </div>

                        {/* Pricing / Market */}
                        <div className="mt-8 pt-6 border-t border-text/10">
                          <span className="block text-[10px] font-mono text-text/40 tracking-widest mb-2 uppercase">Live Market Signal</span>
                          <div className="flex justify-between items-end">
                            <div>
                              {sup.listings.length > 0 && sup.listings[0].price.value ? (
                                <span className="font-mono text-3xl font-bold text-text">
                                  ${sup.listings[0].price.value.toLocaleString()}
                                </span>
                              ) : (
                                <span className="font-mono text-sm font-semibold text-text/40 uppercase">No Price Data</span>
                              )}
                            </div>
                            <DataConfidence confidence={sup.dataConfidence} />
                          </div>
                        </div>
                      </div>

                      {/* Source Link Overlay (only on hover via CSS) */}
                      {sup.website.value && (
                        <a href={sup.website.value} target="_blank" rel="noopener noreferrer"
                          className="absolute inset-0 bg-white/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-8 text-center z-20 border border-text/10">
                          <p className="font-sans font-medium text-text/80 text-lg mb-8">Explore raw data source in isolated environment.</p>
                          <span className="btn-secondary">
                            Access Source
                          </span>
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Buffer for scrolling */}
              <div className="w-[10vw] shrink-0" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Action Footer */}
      {!isLoading && suppliers.length > 0 && (
        <div className="absolute bottom-12 right-12 md:right-24 z-20">
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            onClick={onNext}
            className="btn-signature"
          >
            <span>INGEST QUOTATIONS</span>
          </motion.button>
        </div>
      )}
    </div>
  );
}
