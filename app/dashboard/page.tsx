'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { LiquidButton } from '../../components/ui/LiquidButton';

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0B132B] text-white font-['Inter'] selection:bg-[#39FF88]/30 flex flex-col">
      <header className="h-20 border-b border-white/10 flex items-center justify-between px-8">
        <div className="font-['Cinzel_Decorative'] font-bold text-2xl tracking-widest text-white">DIU NEST</div>
        <div className="flex gap-4 items-center">
          <div className="text-right mr-4 hidden md:block">
            <div className="text-[10px] text-[#39FF88] tracking-widest">INTELLIGENCE STATUS</div>
            <div className="text-sm font-['JetBrains_Mono'] text-white/60">
              LIVE
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            U
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full py-16 px-6">
        <div className="mb-16">
          <h1 className="text-6xl font-['Cinzel_Decorative'] mb-6">Good morning.<br/>What are we buying today?</h1>
          
          <div className="relative max-w-2xl">
            <div className="absolute inset-0 bg-[#39FF88]/20 blur-xl rounded-full" />
            <div className="relative flex">
              <input 
                type="text" 
                placeholder="Describe your procurement need in natural language..." 
                className="w-full bg-[#0B132B] border border-[#39FF88]/50 text-white p-4 pl-6 text-lg outline-none focus:border-[#39FF88] transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') router.push('/mission');
                }}
              />
              <LiquidButton 
                onClick={() => router.push('/mission')} 
                className="ml-4 whitespace-nowrap"
              >
                Start Mission
              </LiquidButton>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-[#39FF88] text-xs tracking-widest mb-6">ACTIVE MISSIONS</h3>
            <GlassPanel className="p-8 text-center">
              <div className="text-white/30 font-['JetBrains_Mono'] text-sm mb-4">NO ACTIVE MISSIONS</div>
              <p className="text-white/20 text-xs font-['JetBrains_Mono'] max-w-md mx-auto mb-6">
                Start a procurement mission to discover real suppliers, compare market data, and make evidence-backed decisions.
              </p>
              <LiquidButton onClick={() => router.push('/mission')}>
                Begin First Mission
              </LiquidButton>
            </GlassPanel>
          </div>

          <div>
            <h3 className="text-white/50 text-xs tracking-widest mb-6">SYSTEM STATUS</h3>
            <GlassPanel className="p-6 h-[calc(100%-2rem)]">
              <div className="space-y-6">
                <div>
                  <div className="text-[10px] text-[#39FF88] tracking-widest mb-1">WEB INTELLIGENCE</div>
                  <p className="text-sm text-white/80 font-['JetBrains_Mono']">
                    Tavily search API — ready when configured
                  </p>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="text-[10px] text-white/50 tracking-widest mb-1">DECISION ENGINE</div>
                  <p className="text-sm text-white/80 font-['JetBrains_Mono']">
                    Deterministic scoring — 5-axis weighted evaluation
                  </p>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="text-[10px] text-white/50 tracking-widest mb-1">DATA POLICY</div>
                  <p className="text-sm text-white/60 font-['JetBrains_Mono']">
                    Zero fake data. Every number sourced. Every claim verified or labeled.
                  </p>
                </div>
              </div>
            </GlassPanel>
          </div>
        </div>
      </main>
    </div>
  );
}
