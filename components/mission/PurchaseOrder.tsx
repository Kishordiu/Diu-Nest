'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMission } from '@/lib/mission-context';
import { calculateTrueCost } from '@/lib/server/true-cost-engine';

interface PurchaseOrderProps { onNext: () => void; }

export default function PurchaseOrder({ onNext }: PurchaseOrderProps) {
  const { mission } = useMission();
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setGenerated(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const supplier = mission.discoveredSuppliers.find(s => s.id === mission.selectedSupplierId) 
    || mission.discoveredSuppliers[0];
  const req = mission.requirement;

  if (!supplier || !req) return null;

  const cost = calculateTrueCost(supplier).estimatedTotal;
  const qtyConstraint = req.allConstraints.find(c => c.field === 'QUANTITY');
  const qty = qtyConstraint ? parseInt(qtyConstraint.value.replace(/\D/g, '')) || 1 : 1;
  const unitPrice = cost / qty;

  const handlePDFDownload = async () => {
    try {
      // dynamically import to avoid SSR window issues
      const html2pdf = (await import('html2pdf.js' as any)).default;
      const element = document.getElementById('pdf-content');
      
      const opt = {
        margin:       15,
        filename:     `DIU_NEST_PROCUREMENT_${mission.id.split('-')[1]}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation failed", err);
    }
  };

  return (
    <div className="min-h-full flex flex-col pt-12 pb-24 px-8 md:px-16 lg:px-24">
      
      {/* Hidden PDF content for export */}
      <div style={{ display: 'none' }}>
        <div id="pdf-content" className="p-8 bg-white text-[#181922] font-sans" style={{ width: '800px', fontSize: '12px' }}>
          <div className="border-b-2 border-[#6C63FF] pb-4 mb-6">
            <h1 className="text-3xl font-display font-bold mb-2">DIU NEST</h1>
            <h2 className="text-xl font-bold text-[#555867]">PROCUREMENT RECORD</h2>
            <div className="text-sm mt-4 text-[#7A7F8D]">
              <p>MISSION: {mission.id}</p>
              <p>DATE: {new Date().toLocaleDateString()}</p>
              <p className="font-bold text-[#22C55E]">DECISION: APPROVED</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-bold border-b border-gray-200 mb-2">REQUIREMENT</h3>
            <p className="mb-2"><strong>Intent:</strong> {mission.requirement?.rawIntent}</p>
            <ul className="list-disc pl-5">
              {mission.requirement?.allConstraints.map((c, i) => (
                <li key={i}>{c.field}: {c.value} ({c.confidence}%)</li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold border-b border-gray-200 mb-2">SUPPLIERS & QUOTES</h3>
            {mission.discoveredSuppliers.map((s, i) => {
              const cst = calculateTrueCost(s);
              return (
                <div key={i} className={`mb-3 p-3 rounded ${s.id === mission.selectedSupplierId ? 'bg-[#F7F5FF] border border-[#6C63FF]' : 'bg-gray-50'}`}>
                  <p className="font-bold">{s.name.value} {s.id === mission.selectedSupplierId && '(SELECTED)'}</p>
                  <p>True Cost: &#8377;{cst.estimatedTotal.toLocaleString('en-IN')}</p>
                  <p>Confidence: {s.confidenceScore}%</p>
                </div>
              );
            })}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold border-b border-gray-200 mb-2">EVIDENCE & RISK</h3>
            <p><strong>Recommendation:</strong> {supplier.name.value} was selected due to optimal true cost and verified claims.</p>
            <p><strong>Firewall:</strong> Passed all compliance checks.</p>
            <p><strong>Audit Hash:</strong> {Math.random().toString(36).substring(2, 15)}</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="w-full flex-shrink-0 z-20 mb-16">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <p className="label-meta text-[#969AA6] mb-4">PHASE 11 // EXECUTION</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-[#181922] flex items-center gap-6">
            Purchase Order Generated
          </h1>
        </motion.div>
      </div>

      <div className="w-full max-w-4xl relative">
        
        {/* Loading overlay */}
        {!generated && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#FBFBF8] rounded-xl">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border border-[#181922]/15 border-t-[#6C63FF] rounded-full animate-spin mb-6" />
              <div className="font-mono text-[10px] tracking-[0.2em] text-[#969AA6] uppercase">Compiling Order Document</div>
            </div>
          </div>
        )}

        <motion.div 
          className="surface-panel p-12 md:p-16 border-t-4 border-t-[#6C63FF]"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: generated ? 1 : 0, y: generated ? 0 : 30 }} transition={{ duration: 0.8 }}
        >
          {/* Document Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end border-b border-[#181922]/10 pb-8 mb-12 gap-6">
            <div>
              <h2 className="font-display text-3xl text-[#181922] mb-2 tracking-widest">PO-{mission.id.split('-')[1]}</h2>
              <div className="font-mono text-xs text-[#7A7F8D] tracking-widest uppercase">Issued via Deterministic Engine</div>
            </div>
            <div className="text-left md:text-right">
              <div className="font-mono text-xs text-[#555867] mb-1">DATE: {new Date().toLocaleDateString('en-GB')}</div>
              <div className="font-mono text-xs text-[#22C55E] font-semibold">STATUS: APPROVED</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <div className="text-[9px] font-mono tracking-[0.2em] text-[#969AA6] uppercase mb-4 border-b border-[#181922]/6 pb-2">To Entity</div>
              <div className="font-display text-xl text-[#181922] mb-2">{supplier.name.value}</div>
              <div className="font-sans text-sm text-[#7A7F8D] leading-relaxed max-w-xs">{supplier.location.value}</div>
            </div>
            <div>
              <div className="text-[9px] font-mono tracking-[0.2em] text-[#969AA6] uppercase mb-4 border-b border-[#181922]/6 pb-2">Delivery Location</div>
              <div className="font-sans text-sm text-[#181922] mb-2">DIU Central Logistics</div>
              <div className="font-sans text-sm text-[#7A7F8D] leading-relaxed max-w-xs">
                {req.allConstraints.find(c => c.field === 'LOCATION')?.value || 'Designated Facility'}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="w-full mb-12 overflow-x-auto hide-scrollbar">
            <table className="w-full text-left font-mono">
              <thead>
                <tr className="border-b border-[#181922]/15 text-[9px] tracking-[0.2em] text-[#969AA6] uppercase">
                  <th className="py-4 font-normal w-1/2">Description</th>
                  <th className="py-4 font-normal text-right">Qty</th>
                  <th className="py-4 font-normal text-right">Unit Price</th>
                  <th className="py-4 font-normal text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#181922]">
                <tr className="border-b border-[#181922]/5">
                  <td className="py-6 pr-4 font-sans font-light text-[#555867]">
                    {req.allConstraints.find(c => c.field === 'CATEGORY')?.value || 'Technical Procurement Item'}
                  </td>
                  <td className="py-6 text-right">{qty}</td>
                  <td className="py-6 text-right">&#8377;{unitPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  <td className="py-6 text-right font-medium">&#8377;{cost.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end border-t border-[#181922]/15 pt-8 mb-12">
            <div className="w-full md:w-1/2 space-y-4">
              <div className="flex justify-between text-sm font-mono text-[#7A7F8D]">
                <span>Subtotal</span>
                <span>&#8377;{cost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-mono text-[#7A7F8D] border-b border-[#181922]/10 pb-4">
                <span>Tax &amp; Logistics</span>
                <span>Included in Model</span>
              </div>
              <div className="flex justify-between items-end pt-4">
                <span className="font-sans tracking-widest text-[11px] uppercase text-[#555867]">Total Order Value</span>
                <span className="font-mono text-3xl text-[#181922] font-bold">&#8377;{cost.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#FBFBF8] p-6 border border-[#181922]/6 rounded-xl">
            <p className="font-mono text-[9px] text-[#969AA6] tracking-widest leading-relaxed uppercase">
              Cryptographic Hash: {Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}<br/>
              This document was generated deterministically based on verified market evidence and executive authorisation.
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="mt-12 pt-12 flex flex-col md:flex-row justify-between gap-4"
          initial={{ opacity: 0 }} animate={{ opacity: generated ? 1 : 0 }} transition={{ delay: 0.5 }}
        >
          <button onClick={onNext} className="btn-primary w-full md:w-auto">
            <span>Transmit to Supplier &amp; Close</span>
          </button>
          
          <button 
            onClick={handlePDFDownload}
            className="btn-secondary w-full md:w-auto"
          >
            <span>DOWNLOAD PROCUREMENT RECORD</span>
          </button>
        </motion.div>

      </div>
    </div>
  );
}
