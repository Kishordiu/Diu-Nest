'use client';
import React, { useRef, useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

const CARDS = [
  {
    type: 'dossier',
    title: 'SUPPLIER DOSSIER',
    name: 'Verified Entity',
    metric: 'LIVE DATA',
    evidence: 'Certifications cross-checked against registries',
    color: '#6C63FF',
    initialPos: { x: -30, y: -20, rotate: -4, z: 20 },
    delay: 0.2,
  },
  {
    type: 'quote',
    title: 'QUOTATION SHEET',
    name: 'Extracted Document',
    metric: 'TRUE COST',
    evidence: 'Market-validated pricing with hidden cost modelling',
    color: '#D946EF',
    initialPos: { x: 30, y: -5, rotate: 2, z: 40 },
    delay: 0.4,
  },
  {
    type: 'challenge',
    title: 'CHALLENGER',
    name: 'Decision Under Test',
    metric: 'EVIDENCE',
    evidence: 'Every recommendation must survive adversarial review',
    color: '#FFB86B',
    initialPos: { x: -10, y: 35, rotate: -2, z: 60 },
    delay: 0.6,
  }
];

function ConstellationCard({ card, index, springX, springY }: { card: typeof CARDS[0], index: number, springX: any, springY: any }) {
  const moveX = useTransform(springX, [-1, 1], [card.initialPos.z * -1, card.initialPos.z]);
  const moveY = useTransform(springY, [-1, 1], [card.initialPos.z * -1, card.initialPos.z]);
  const rotateX = useTransform(springY, [-1, 1], [card.initialPos.z * 0.1, card.initialPos.z * -0.1]);
  const rotateY = useTransform(springX, [-1, 1], [card.initialPos.z * -0.1, card.initialPos.z * 0.1]);

  return (
    <motion.div
      className="absolute surface-panel p-6 w-[320px] flex flex-col gap-6 select-none"
      initial={{ 
        opacity: 0, 
        x: `${card.initialPos.x + (index % 2 === 0 ? -20 : 20)}%`, 
        y: `${card.initialPos.y + 20}%`, 
        rotateZ: 0 
      }}
      animate={{ 
        opacity: 1, 
        x: `${card.initialPos.x}%`, 
        y: `${card.initialPos.y}%`, 
        rotateZ: card.initialPos.rotate 
      }}
      transition={{ 
        duration: 1.2, 
        delay: card.delay,
        ease: [0.16, 1, 0.3, 1] 
      }}
      style={{
        x: moveX,
        y: moveY,
        rotateX,
        rotateY,
        rotateZ: card.initialPos.rotate,
        transformStyle: 'preserve-3d'
      }}
      whileHover={{ scale: 1.05, zIndex: 50, transition: { duration: 0.4 } }}
    >
      {/* Top label */}
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: card.color }} />
        <div className="label-meta tracking-widest text-[9px] text-[#969AA6]">{card.title}</div>
      </div>

      {/* Content */}
      <div>
        <div className="font-mono text-[#969AA6] text-[9px] mb-1 tracking-wider uppercase">Subject</div>
        <div className="font-sans text-base font-medium text-[#181922] tracking-tight">{card.name}</div>
      </div>

      <div className="border-t border-[#181922]/6 pt-3">
        <div className="font-mono text-lg font-semibold mb-1" style={{ color: card.color }}>
          {card.metric}
        </div>
        <div className="text-[#7A7F8D] text-[10px] leading-relaxed font-sans">
          {card.evidence}
        </div>
      </div>
      
      {/* Decorative corner brackets */}
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#181922]/10 m-2" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#181922]/10 m-2" />
    </motion.div>
  );
}

export function NestConstellation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[600px] flex items-center justify-center overflow-hidden"
      style={{ perspective: '1200px' }}
    >
      {/* Central Large Visual */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full overflow-hidden flex items-center justify-center border-2 border-white/50 shadow-2xl"
        style={{
          x: useTransform(springX, [-1, 1], [-20, 20]),
          y: useTransform(springY, [-1, 1], [-20, 20]),
          background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.2))',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 32px 64px rgba(108, 99, 255, 0.15), inset 0 2px 4px rgba(255,255,255,0.5)'
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <img src="/logo.jpg" alt="DIU NEST Logo" className="w-full h-full object-cover mix-blend-multiply opacity-90" />
      </motion.div>

      {CARDS.map((card, i) => (
        <ConstellationCard key={i} card={card} index={i} springX={springX} springY={springY} />
      ))}

      {/* Floating particles — aurora colors, not white */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#6C63FF]/40 rounded-full blur-[1px]"
        animate={{ y: [-10, 10, -10], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div 
        className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-[#D946EF]/40 rounded-full blur-[2px]"
        animate={{ y: [15, -15, 15], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </div>
  );
}
