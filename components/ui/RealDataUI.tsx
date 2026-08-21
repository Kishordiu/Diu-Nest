'use client';

import React from 'react';
import type { DataLabel, VerificationStatus } from '@/lib/types';

// SourceBadge — shows data origin
export function SourceBadge({ label, timestamp }: { label: DataLabel; timestamp?: string }) {
  const config: Record<DataLabel, { text: string; color: string; dot: string }> = {
    'live-web':           { text: 'LIVE WEB',           color: 'text-[#22C55E]',   dot: 'bg-[#22C55E]' },
    'cached-web':         { text: 'CACHED WEB',         color: 'text-[#22C55E]/70', dot: 'bg-[#22C55E]/70' },
    'uploaded-document':  { text: 'DOCUMENT',            color: 'text-[#6C63FF]',   dot: 'bg-[#6C63FF]' },
    'calculated':         { text: 'CALCULATED',          color: 'text-[#7A7F8D]',   dot: 'bg-[#7A7F8D]' },
    'simulation':         { text: 'SIMULATION',          color: 'text-[#FFB86B]',   dot: 'bg-[#FFB86B]' },
    'ai-inference':       { text: 'AI INFERENCE',        color: 'text-[#D946EF]',   dot: 'bg-[#D946EF]' },
    'user-input':         { text: 'USER INPUT',          color: 'text-[#969AA6]',   dot: 'bg-[#969AA6]' },
    'organizational':     { text: 'ORG DATA',            color: 'text-blue-500',    dot: 'bg-blue-500' },
  };

  const c = config[label] || config['calculated'];
  const age = timestamp ? formatAge(timestamp) : null;

  return (
    <span className={`inline-flex items-center gap-1.5 text-[9px] tracking-[0.15em] font-mono ${c.color} uppercase`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${label === 'live-web' ? 'animate-pulse' : ''}`} />
      {c.text}
      {age && <span className="text-[#969AA6] ml-1">{age}</span>}
    </span>
  );
}

// StatusLabel
export function StatusLabel({ status }: { status: VerificationStatus }) {
  const config: Record<VerificationStatus, { text: string; cls: string }> = {
    'verified':       { text: 'VERIFIED',          cls: 'text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/5' },
    'supported':      { text: 'SUPPORTED',         cls: 'text-[#22C55E]/80 border-[#22C55E]/20 bg-[#22C55E]/5' },
    'self-declared':  { text: 'SELF-DECLARED',     cls: 'text-[#FFB86B] border-[#FFB86B]/30 bg-[#FFB86B]/5' },
    'unverified':     { text: 'NOT VERIFIED',      cls: 'text-[#969AA6] border-[#181922]/10 bg-[#181922]/5' },
    'conflict':       { text: 'CONFLICT DETECTED', cls: 'text-[#FF5FA2] border-[#FF5FA2]/30 bg-[#FF5FA2]/5' },
    'not-available':  { text: 'DATA NOT AVAILABLE', cls: 'text-[#969AA6] border-[#181922]/10 bg-transparent' },
    'stale':          { text: 'STALE',             cls: 'text-[#FFB86B] border-[#FFB86B]/30 bg-[#FFB86B]/5' },
  };

  const c = config[status] || config['unverified'];
  return (
    <span className={`inline-block text-[9px] tracking-[0.15em] font-mono px-2 py-0.5 border rounded ${c.cls}`}>
      {c.text}
    </span>
  );
}

// DataConfidence
export function DataConfidence({ confidence, label }: { confidence: number; label?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] tracking-[0.15em] font-mono text-[#969AA6] uppercase">{label || 'DATA CONFIDENCE'}</span>
        <span className="text-sm font-mono text-[#181922]">{confidence}%</span>
      </div>
      <div className="w-full h-1 bg-[#181922]/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${confidence}%`,
            background: confidence >= 70 ? '#22C55E' : confidence >= 40 ? '#FFB86B' : '#FF5FA2',
          }}
        />
      </div>
      <span className="text-[8px] text-[#969AA6] font-mono">
        This measures data completeness, not supplier quality.
      </span>
    </div>
  );
}

// ProvenanceLink
export function ProvenanceLink({
  value, sourceUrl, sourceName, children
}: {
  value?: string; sourceUrl?: string; sourceName?: string; children?: React.ReactNode;
}) {
  if (!sourceUrl) {
    return <span className="text-[#969AA6]">{children || value || 'N/A'}</span>;
  }
  return (
    <a
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative inline-flex items-center gap-1 text-[#6C63FF] hover:text-[#8B5CF6] transition-colors cursor-pointer"
      title={`Source: ${sourceName || sourceUrl}`}
    >
      {children || value}
      <svg className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}

// SearchActivityPanel
export function SearchActivityPanel({ activities }: { activities: Array<{ query: string; status: string; resultsFound: number; suppliersIdentified: number; durationMs: number; error?: string }> }) {
  if (activities.length === 0) return null;
  return (
    <div className="surface-panel p-4 space-y-3">
      <h3 className="text-[10px] tracking-[0.2em] font-mono text-[#7A7F8D] uppercase">Live Web Intelligence</h3>
      {activities.map((a, i) => (
        <div key={i} className="flex items-start gap-3 text-xs">
          <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.status === 'complete' ? 'bg-[#22C55E]' : a.status === 'error' ? 'bg-[#FF5FA2]' : 'bg-[#FFB86B] animate-pulse'}`} />
          <div className="flex-1 min-w-0">
            <span className="font-mono text-[#181922] block truncate">&quot;{a.query}&quot;</span>
            {a.status === 'complete' && (
              <span className="text-[#7A7F8D] font-mono text-[10px]">
                &#10003; {a.resultsFound} results &middot; {a.suppliersIdentified} suppliers &middot; {a.durationMs}ms
              </span>
            )}
            {a.status === 'error' && (
              <span className="text-[#FF5FA2] font-mono text-[10px]">&#10007; {a.error}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// MarketRange
export function MarketRangeDisplay({ lowest, highest, median, sourceCount, currency }: {
  lowest: number; highest: number; median: number; sourceCount: number; currency: string;
}) {
  const sym = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;
  return (
    <div className="surface-panel p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] tracking-[0.2em] font-mono text-[#7A7F8D] uppercase">Observed Online Market Range</h3>
        <SourceBadge label="live-web" />
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-mono text-lg text-[#181922]">{sym}{lowest.toLocaleString('en-IN')}</span>
        <span className="text-[#969AA6]">&mdash;</span>
        <span className="font-mono text-lg text-[#181922]">{sym}{highest.toLocaleString('en-IN')}</span>
      </div>
      <div className="flex items-center gap-4 text-[10px] font-mono text-[#7A7F8D]">
        <span>Median: {sym}{median.toLocaleString('en-IN')}</span>
        <span>{sourceCount} source{sourceCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}

function formatAge(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return 'just now';
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ago`;
  return `${Math.floor(ms / 86400000)}d ago`;
}
