'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useMission } from '@/lib/mission-context';
import { SourceBadge, MarketRangeDisplay } from '@/components/ui/RealDataUI';

interface Props { onNext?: () => void; }

export function NegotiationIntelligence({ onNext }: Props) {
  const { mission } = useMission();
  const marketRange = mission.marketRange;
  const topScore = [...mission.decisionScores].sort((a, b) => b.totalScore - a.totalScore)[0];
  const topSupplier = mission.discoveredSuppliers.find(s => s.id === topScore?.supplierId);

  return (
    <div className="min-h-full bg-[#FBFBF8] text-[#181922] flex flex-col items-center py-12 px-8">
      <motion.h1 className="font-display text-4xl md:text-5xl font-bold tracking-wider mb-4 text-center"
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        NEGOTIATION INTELLIGENCE
      </motion.h1>
      <div className="flex items-center gap-2 mb-8">
        <SourceBadge label="ai-inference" />
        <span className="text-[9px] font-mono text-[#8B5CF6] tracking-wider font-medium">AI-ASSISTED SUGGESTIONS</span>
      </div>

      {marketRange && (
        <div className="w-full max-w-xl mb-8">
          <MarketRangeDisplay lowest={marketRange.lowest} highest={marketRange.highest}
            median={marketRange.median} sourceCount={marketRange.sourceCount} currency={marketRange.currency} />
        </div>
      )}

      {topSupplier && topSupplier.listings[0]?.price?.value && marketRange ? (
        <div className="w-full max-w-2xl surface-panel p-6">
          <h3 className="text-[10px] tracking-[0.2em] font-mono text-[#7A7F8D] mb-4">NEGOTIATION LEVERAGE POINTS</h3>
          <div className="space-y-4">
            {topSupplier.listings[0].price.value > marketRange.median && (
              <div className="flex items-start gap-3 p-3 bg-white border border-[#181922]/6 rounded-lg">
                <span className="text-[#6C63FF] mt-0.5 font-bold">→</span>
                <div>
                  <p className="text-sm text-[#555867] font-mono">Price is above observed market median</p>
                  <p className="text-xs text-[#7A7F8D] font-mono mt-1">
                    Listed at ₹{topSupplier.listings[0].price.value.toLocaleString('en-IN')} vs median ₹{marketRange.median.toLocaleString('en-IN')}.
                    Potential negotiation range: ₹{(topSupplier.listings[0].price.value - marketRange.median).toLocaleString('en-IN')}.
                  </p>
                </div>
              </div>
            )}
            {mission.discoveredSuppliers.length > 1 && (
              <div className="flex items-start gap-3 p-3 bg-white border border-[#181922]/6 rounded-lg">
                <span className="text-[#6C63FF] mt-0.5 font-bold">→</span>
                <div>
                  <p className="text-sm text-[#555867] font-mono">Multiple suppliers available</p>
                  <p className="text-xs text-[#7A7F8D] font-mono mt-1">
                    {mission.discoveredSuppliers.length} suppliers identified. Competitive quotes strengthen negotiation position.
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-3 bg-white border border-[#181922]/6 rounded-lg">
              <span className="text-[#6C63FF] mt-0.5 font-bold">→</span>
              <div>
                <p className="text-sm text-[#555867] font-mono">Request for formal quotation</p>
                <p className="text-xs text-[#7A7F8D] font-mono mt-1">
                  Current prices are market listings, not formal quotes. Request RFQ for binding price with terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="surface-panel p-8 max-w-md text-center">
          <p className="text-[#7A7F8D] font-mono text-sm">Insufficient market data for negotiation analysis.</p>
        </div>
      )}

      {onNext && (
        <button onClick={onNext} className="mt-8 editorial-btn editorial-btn-primary px-8 py-3 tracking-widest font-bold uppercase">
          Continue
        </button>
      )}
    </div>
  );
}

export default NegotiationIntelligence;
