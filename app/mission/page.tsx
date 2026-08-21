'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MissionProvider, useMission } from '@/lib/mission-context';

import MissionInput from '@/components/mission/MissionInput';
import IntentCompiler from '@/components/mission/IntentCompiler';
import RequirementConfirm from '@/components/mission/RequirementConfirm';
import SupplierDiscovery from '@/components/mission/SupplierDiscovery';
import QuoteComparison from '@/components/mission/QuoteComparison';
import TrueCostEngine from '@/components/mission/TrueCostEngine';
import EvidenceGraph from '@/components/mission/EvidenceGraph';
import AdvocateChallengerDecision from '@/components/mission/AdvocateChallengerDecision';
import WhatIfSimulator from '@/components/mission/WhatIfSimulator';
import DigitalTwin from '@/components/mission/DigitalTwin';
import ProcurementFirewall from '@/components/mission/ProcurementFirewall';
import ApprovalPanel from '@/components/mission/ApprovalPanel';
import PurchaseOrder from '@/components/mission/PurchaseOrder';
import { ProcurementMemory } from '@/components/mission/ProcurementMemory';

const STEPS = [
  { id: 'input', label: 'REQUIREMENT' },
  { id: 'intent', label: 'INTENT' },
  { id: 'confirm', label: 'CONFIRM' },
  { id: 'suppliers', label: 'DISCOVERY' },
  { id: 'comparison', label: 'COMPARE' },
  { id: 'truecost', label: 'TRUE COST' },
  { id: 'evidence', label: 'EVIDENCE' },
  { id: 'decision', label: 'DECISION' },
  { id: 'simulation', label: 'SIMULATE' },
  { id: 'twin', label: 'TWIN' },
  { id: 'firewall', label: 'FIREWALL' },
  { id: 'approval', label: 'APPROVE' },
  { id: 'po', label: 'ORDER' },
  { id: 'memory', label: 'LEARN' },
];

function MissionFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const { mission } = useMission();

  const goNext = () => setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
  const goPrev = () => setCurrentStep(s => Math.max(s - 1, 0));

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'input': return <MissionInput onNext={goNext} />;
      case 'intent': return <IntentCompiler onNext={goNext} />;
      case 'confirm': return <RequirementConfirm onNext={goNext} />;
      case 'suppliers': return <SupplierDiscovery onNext={goNext} />;
      case 'comparison': return <QuoteComparison onNext={goNext} />;
      case 'truecost': return <TrueCostEngine onNext={goNext} />;
      case 'evidence': return <EvidenceGraph onNext={goNext} />;
      case 'decision': return <AdvocateChallengerDecision onNext={goNext} />;
      case 'simulation': return <WhatIfSimulator onNext={goNext} />;
      case 'twin': return <DigitalTwin onNext={goNext} />;
      case 'firewall': return <ProcurementFirewall onNext={goNext} />;
      case 'approval': return <ApprovalPanel onNext={goNext} />;
      case 'po': return <PurchaseOrder onNext={goNext} />;
      case 'memory': return <ProcurementMemory />;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-base overflow-hidden text-text selection:bg-aurora-2 selection:text-white">
      {/* Global Light Aurora Background */}
      <div className="fixed inset-0 pointer-events-none z-0 mix-blend-multiply opacity-20">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-aurora-1 blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] rounded-full bg-aurora-4 blur-[120px] opacity-10" />
      </div>

      {/* Desktop Floating Progress Rail */}
      <div className="hidden md:flex flex-col w-72 fixed left-12 top-1/2 -translate-y-1/2 z-50">
        <div className="liquid-glass-02 p-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-text/10">
          <div className="font-display font-bold text-text tracking-[0.2em] text-xs mb-8">
            DIU NEST MISSION
          </div>
          <div className="flex flex-col gap-4 relative">
            {/* Track line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-text/10" />
            
            {STEPS.map((step, i) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(i)}
                className={`flex items-center gap-5 text-left transition-all ${i === currentStep ? 'opacity-100 scale-105 origin-left' : 'opacity-40 hover:opacity-70'}`}
              >
                <div className={`w-4 h-4 rounded-full border-2 bg-base z-10 transition-colors ${i === currentStep ? 'border-aurora-4 bg-aurora-4' : i < currentStep ? 'border-text/30 bg-text/10' : 'border-text/20'}`} />
                <span className={`text-[11px] font-mono tracking-widest font-semibold uppercase ${i === currentStep ? 'text-aurora-4' : 'text-text'}`}>
                  {step.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Top Progress */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-text/10 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="font-display font-bold text-sm tracking-widest text-text">DIU NEST</div>
        <div className="text-xs font-mono tracking-widest text-text/60 font-semibold">
          {String(currentStep + 1).padStart(2,'0')} / {STEPS.length}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 md:ml-80 h-screen overflow-y-auto overflow-x-hidden relative pt-20 md:pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="min-h-full pb-32"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function MissionPage() {
  return (
    <MissionProvider>
      <MissionFlow />
    </MissionProvider>
  );
}
