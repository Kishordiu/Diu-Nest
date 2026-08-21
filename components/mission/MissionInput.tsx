'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMission } from '@/lib/mission-context';

interface MissionInputProps { onNext: () => void; }

export default function MissionInput({ onNext }: MissionInputProps) {
  const [text, setText] = useState('');
  const { submitRequirement, isLoading } = useMission();
  const [signals, setSignals] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (text.length > 10) {
      const found: string[] = [];
      if (/\d+/.test(text)) found.push('QUANTITY');
      if (/₹|Rs|INR|\$|budget|lakh|L\b/i.test(text)) found.push('BUDGET');
      if (/chennai|mumbai|delhi|bangalore|hyderabad|pune|kolkata|india/i.test(text)) found.push('LOCATION');
      if (/\d+\s*(days?|weeks?|months?)/i.test(text)) found.push('DEADLINE');
      if (/sensor|chair|laptop|printer|PPE|equipment|motor|pump|valve/i.test(text)) found.push('CATEGORY');
      setSignals(found);
    } else { setSignals([]); }
  }, [text]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    await submitRequirement(text);
    onNext();
  };

  return (
    <motion.div 
      className="min-h-full flex flex-col justify-center p-8 md:p-16 lg:p-24 relative"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
    >
      {/* Editorial Header */}
      <div className="w-full max-w-4xl mb-12">
        <motion.h1 
          className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-text"
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          What do you need?
        </motion.h1>
      </div>

      <div className="w-full max-w-4xl flex flex-col gap-8">
        {/* Command Slate Input */}
        <motion.div 
          className="relative group liquid-glass-02 overflow-hidden"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <textarea
            ref={textareaRef}
            className="w-full min-h-[250px] bg-transparent p-8 text-2xl md:text-3xl font-serif italic text-text placeholder-text/30 outline-none resize-none transition-all duration-500"
            placeholder="Describe your requirement in plain English..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
          />
        </motion.div>

        {/* Suggestion Pills */}
        <motion.div 
          className="flex flex-wrap gap-3 items-center"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.4 }}
        >
          <span className="text-[10px] font-mono tracking-widest text-text/50 uppercase">Examples:</span>
          {['500 medical-grade temperature sensors, ₹5L, Chennai, 10 days',
            '200 ergonomic office chairs, ₹8L, Bangalore, 30 days'
          ].map((pill, i) => (
            <button 
              key={i} 
              onClick={() => {
                setText(pill);
                textareaRef.current?.focus();
              }}
              className="text-[11px] font-sans bg-white text-text/70 border border-text/10 px-4 py-2 rounded-full hover:bg-aurora-1 hover:text-white hover:border-aurora-1 transition-all shadow-sm"
            >
              {pill}
            </button>
          ))}
        </motion.div>

        {/* Action Button & Signals */}
        <motion.div 
          className="mt-8 flex items-center justify-between" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.6 }}
        >
          <div className="flex gap-2">
            <AnimatePresence>
              {signals.map((sig, idx) => (
                <motion.div 
                  key={sig} 
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: idx * 0.05 }}
                  className="px-3 py-1.5 text-[9px] font-mono tracking-widest text-white bg-text rounded-full shadow-md uppercase"
                >
                  {sig}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={!text.trim() || isLoading}
            className="editorial-btn editorial-btn-primary bg-aurora-gradient text-white border-none shadow-[0_4px_16px_rgba(108,99,255,0.2)] hover:shadow-[0_8px_24px_rgba(108,99,255,0.3)] disabled:opacity-50 disabled:grayscale transition-all rounded-full px-8 py-3"
          >
            <span className="tracking-widest text-[11px] uppercase font-bold">
              {isLoading ? 'COMPILING...' : 'CONTINUE →'}
            </span>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
