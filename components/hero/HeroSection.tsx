'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { NestConstellation } from './NestConstellation';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden">
      {/* Soft aurora light field — atmospheric, not a coloured blob */}
      <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(108,99,255,0.06) 0%, rgba(139,92,246,0.04) 30%, transparent 70%)' }}
      />
      <div className="absolute bottom-[-30%] left-[-10%] w-[50vw] h-[50vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,95,162,0.04) 0%, transparent 60%)' }}
      />

      <div className="container-diu w-full flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-8 relative z-10">

        {/* Left: Editorial content */}
        <div className="flex-1 flex flex-col items-start max-w-2xl">
          {/* Eyebrow */}
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="h-px w-6 bg-[#181922]/15" />
            <span className="label-meta text-[10px] tracking-[0.2em] text-[#969AA6]">PROCUREMENT INTELLIGENCE</span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <h1 className="headline-massive mb-5">
              BUY <span className="text-transparent bg-clip-text bg-aurora-gradient animate-aurora-pan">SMARTER.</span><br />
              PROVE <span className="text-transparent bg-clip-text bg-aurora-gradient animate-aurora-pan">WHY.</span>
            </h1>
            <p className="text-[#555867] text-lg md:text-xl font-sans font-light leading-relaxed max-w-lg">
              DIU NEST turns procurement requirements into live, evidence-backed, explainable buying decisions.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-16"
          >
            <Link href="/mission" className="btn-signature group">
              <span>START A PROCUREMENT MISSION</span>
            </Link>
            <a href="#architecture" className="font-mono text-xs tracking-widest text-[#969AA6] hover:text-[#181922] uppercase transition-colors">
              How It Works &darr;
            </a>
          </motion.div>

          {/* Capability indicators */}
          <motion.div
            className="flex gap-10 border-t border-[#181922]/5 pt-6 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <div>
              <div className="text-[9px] font-mono text-[#969AA6] tracking-[0.15em] mb-1">DATA SOURCE</div>
              <div className="text-xs font-mono text-[#555867] font-medium">LIVE WEB</div>
            </div>
            <div>
              <div className="text-[9px] font-mono text-[#969AA6] tracking-[0.15em] mb-1">LOGIC</div>
              <div className="text-xs font-mono text-[#555867] font-medium">DETERMINISTIC</div>
            </div>
            <div>
              <div className="text-[9px] font-mono text-[#969AA6] tracking-[0.15em] mb-1">CONTROL</div>
              <div className="text-xs font-mono text-[#555867] font-medium">HUMAN APPROVAL</div>
            </div>
          </motion.div>
        </div>

        {/* Right: Constellation */}
        <motion.div
          className="flex-1 w-full flex justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <NestConstellation />
        </motion.div>
      </div>
    </section>
  );
}
