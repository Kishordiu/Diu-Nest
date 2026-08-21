'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useMission } from '@/lib/mission-context';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { calculateTrueCost } from '@/lib/server/true-cost-engine';

export function ProcurementMemory() {
  const { mission, dispatch } = useMission();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsGenerating(true);

    try {
      // Temporarily make the offscreen element visible for html2canvas
      pdfRef.current.style.display = 'block';
      
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      pdfRef.current.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`DIU_NEST_Record_${mission.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedSupplier = mission.discoveredSuppliers.find(s => s.id === mission.selectedSupplierId) || mission.discoveredSuppliers[0];
  const costBreakdown = selectedSupplier ? calculateTrueCost(selectedSupplier) : null;

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 relative overflow-hidden bg-base">
      
      {/* Soft aurora light field */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[30%] w-[40vw] h-[40vw] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(108,99,255,0.06) 0%, transparent 60%)' }} />
        <div className="absolute bottom-[10%] right-[20%] w-[30vw] h-[30vw] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(217,70,239,0.04) 0%, transparent 60%)' }} />
      </div>

      <motion.div 
        className="w-full max-w-5xl flex flex-col items-center text-center relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="w-20 h-20 border border-text/10 rounded-2xl flex items-center justify-center mb-16 shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white">
          <div className="w-3 h-3 bg-aurora-4 rounded-full animate-pulse" />
        </div>

        <p className="font-mono text-[10px] tracking-[0.3em] text-text/50 uppercase mb-6 font-bold">
          MISSION {mission.id} CONCLUDED
        </p>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-text mb-12 leading-tight">
          Event Recorded<br/>in Memory.
        </h1>

        <div className="flex flex-col items-center gap-4 max-w-2xl">
          <p className="font-sans font-light text-text/60 text-xl md:text-2xl leading-relaxed text-center mb-16">
            The decision tree, evidence topology, and financial commitments have been cryptographically hashed and stored in the procurement ledger.
          </p>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <Link 
              href="/" 
              onClick={() => setTimeout(() => dispatch({ type: 'RESET' }), 500)}
              className="btn-signature"
            >
              <span>RETURN TO HEADQUARTERS</span>
            </Link>
            
            <button 
              onClick={downloadPDF}
              disabled={isGenerating}
              className="btn-secondary disabled:opacity-50"
            >
              {isGenerating ? 'GENERATING PDF...' : 'DOWNLOAD PROCUREMENT RECORD'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Hidden PDF Template */}
      <div 
        ref={pdfRef} 
        className="absolute top-0 left-0 w-[800px] bg-white p-16 text-text hidden"
        style={{ zIndex: -1000, display: 'none' }}
      >
        <div className="border-b-4 border-aurora-4 pb-8 mb-12 flex justify-between items-end">
          <div>
            <h1 className="font-display text-5xl font-bold mb-2">PROCUREMENT MEMORY</h1>
            <p className="font-mono text-sm text-text/50 tracking-widest uppercase">ID: {mission.id}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm text-text/50 tracking-widest uppercase mb-1">DATE RECORDED</p>
            <p className="font-sans font-bold text-lg">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="font-mono text-xs tracking-widest text-text/50 uppercase mb-4">ORIGINAL REQUIREMENT</h2>
          <p className="font-sans text-2xl font-light leading-relaxed border-l-4 border-text/10 pl-6 py-2">
            &quot;{mission.rawInput}&quot;
          </p>
        </div>

        {selectedSupplier && (
          <div className="mb-12">
            <h2 className="font-mono text-xs tracking-widest text-text/50 uppercase mb-6">SELECTED VENDOR</h2>
            <div className="bg-text/5 p-8 rounded-xl border border-text/10">
              <h3 className="font-display text-4xl font-bold mb-4">{selectedSupplier.name.value}</h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-mono text-[10px] tracking-widest text-text/50 uppercase mb-1">LOCATION</p>
                  <p className="font-sans text-lg font-semibold">{selectedSupplier.location.value}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-widest text-text/50 uppercase mb-1">TYPE</p>
                  <p className="font-sans text-lg font-semibold">{selectedSupplier.supplierType.value}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {costBreakdown && (
          <div className="mb-12">
            <h2 className="font-mono text-xs tracking-widest text-text/50 uppercase mb-6">FINANCIAL COMMITMENT</h2>
            <div className="border border-text/10 rounded-xl overflow-hidden">
              <div className="flex justify-between p-6 border-b border-text/10 bg-text/5">
                <span className="font-sans font-semibold">Base Quote</span>
                <span className="font-mono font-bold">${(costBreakdown.quotedSubtotal?.value || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-6 border-b border-text/10">
                <span className="font-sans text-text/70">Estimated Shipping</span>
                <span className="font-mono text-text/70">+${(costBreakdown.shipping?.value || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-6 border-b border-text/10">
                <span className="font-sans text-text/70">Compliance Buffer (Tax)</span>
                <span className="font-mono text-text/70">+${(costBreakdown.tax?.value || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-6 bg-text/5">
                <span className="font-sans font-bold text-xl">TRUE COST ESTIMATE</span>
                <span className="font-mono font-bold text-2xl text-aurora-4">${costBreakdown.estimatedTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-24 pt-8 border-t-2 border-text/10 text-center">
          <p className="font-mono text-[10px] tracking-[0.2em] text-text/40 uppercase mb-2">CRYPTOGRAPHICALLY SECURED RECORD</p>
          <p className="font-mono text-[8px] tracking-widest text-text/30 break-all max-w-2xl mx-auto">
            {btoa(JSON.stringify(mission)).substring(0, 150)}...
          </p>
        </div>
      </div>

    </div>
  );
}
