'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
}

const AURORA_COLORS = [
  '#6C63FF', // violet
  '#8B5CF6', // purple
  '#D946EF', // pink
  '#FF5FA2', // hot pink
  '#FFB86B', // peach
];

type CursorState = 'default' | 'button' | 'card' | 'logo' | 'evidence';

export function CustomCursor() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Spring config adjusts based on state
  const springConfig = cursorState === 'button' ? { stiffness: 400, damping: 25 } : { stiffness: 600, damping: 40 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);
  
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleId = useRef(0);
  const frameRef = useRef<number>(0);
  const lastPos = useRef({ x: -100, y: -100 });

  const spawnParticle = useCallback((x: number, y: number, state: CursorState) => {
    // Determine number of particles based on state
    const count = state === 'logo' ? 2 : state === 'button' ? 3 : 1;
    
    const newParticles: Particle[] = [];
    for(let i=0; i<count; i++) {
      const color = AURORA_COLORS[Math.floor(Math.random() * AURORA_COLORS.length)];
      // Different spread based on state
      const spread = state === 'logo' ? 20 : state === 'button' ? 12 : 8;
      
      newParticles.push({
        id: particleId.current++,
        x: x + (Math.random() - 0.5) * spread,
        y: y + (Math.random() - 0.5) * spread,
        size: 2 + Math.random() * 4,
        opacity: 0.5 + Math.random() * 0.5,
        color,
        life: 1,
      });
    }
    
    setParticles(prev => [...prev.slice(-18 + count), ...newParticles]);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    setIsDesktop(window.innerWidth > 768);
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);

    const handleMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const el = document.elementFromPoint(e.clientX, e.clientY);
      let newState: CursorState = 'default';
      
      if (el) {
        if (el.closest('button, a, [role="button"], .btn-signature, .btn-primary')) {
          newState = 'button';
        } else if (el.closest('.diu-card, .liquid-glass-02, .surface-panel')) {
          newState = 'card';
        } else if (el.closest('nav svg, .font-display.font-bold')) {
          newState = 'logo';
        } else if (el.closest('.surface-evidence, [data-evidence]')) {
          newState = 'evidence';
        }
      }
      setCursorState(newState);

      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Always spawn if moving, spawn more if special state
      if (dist > 5 || newState === 'logo' || newState === 'button') {
        spawnParticle(e.clientX, e.clientY, newState);
        lastPos.current = { x: e.clientX, y: e.clientY };
      }
    };

    document.addEventListener('mousemove', handleMove);
    // Hide default cursor
    document.documentElement.style.cursor = 'none';
    const style = document.createElement('style');
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      window.removeEventListener('resize', handleResize);
      document.documentElement.style.cursor = '';
      if(style.parentNode) document.head.removeChild(style);
    };
  }, [cursorX, cursorY, spawnParticle]);

  // Decay particles
  useEffect(() => {
    const decay = () => {
      setParticles(prev =>
        prev
          .map(p => ({ ...p, life: p.life - 0.05 }))
          .filter(p => p.life > 0)
      );
      frameRef.current = requestAnimationFrame(decay);
    };
    frameRef.current = requestAnimationFrame(decay);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  if (!isDesktop) return null;

  // State-based styles for the halo
  let haloSize = 32;
  let haloOpacity = 0.15;
  let haloBorder = 'none';
  let haloBackground = 'radial-gradient(circle, rgba(108,99,255,0.4) 0%, rgba(217,70,239,0.1) 60%, transparent 100%)';
  let haloScale = 1;

  switch (cursorState) {
    case 'button':
      haloSize = 48;
      haloOpacity = 0.3;
      haloScale = 1.2;
      haloBackground = 'radial-gradient(circle, rgba(108,99,255,0.6) 0%, rgba(217,70,239,0.2) 60%, transparent 100%)';
      break;
    case 'card':
      haloSize = 64;
      haloOpacity = 0.1;
      haloScale = 1.1;
      break;
    case 'logo':
      haloSize = 40;
      haloOpacity = 0.2;
      haloBorder = '1px dashed rgba(108,99,255,0.5)';
      haloBackground = 'transparent';
      break;
    case 'evidence':
      haloSize = 36;
      haloOpacity = 0.25;
      haloBorder = '2px solid rgba(34,197,94,0.4)';
      haloBackground = 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)';
      break;
  }

  return (
    <>
      {/* Trailing particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="fixed top-0 left-0 pointer-events-none z-[99998] rounded-full"
          style={{
            transform: `translate(${p.x - p.size / 2}px, ${p.y - p.size / 2}px)`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.opacity * p.life,
            filter: 'blur(1px)',
          }}
        />
      ))}

      {/* Halo */}
      <motion.div
        className="fixed top-0 left-0 z-[99999] pointer-events-none rounded-full flex items-center justify-center"
        style={{
          x: springX,
          y: springY,
          width: haloSize,
          height: haloSize,
          marginLeft: -haloSize / 2,
          marginTop: -haloSize / 2,
          background: haloBackground,
          opacity: haloOpacity,
          border: haloBorder,
          scale: haloScale,
          transition: 'width 0.2s, height 0.2s, margin 0.2s, background 0.3s, opacity 0.3s, scale 0.2s'
        }}
      >
        {cursorState === 'evidence' && (
          <div className="w-1 h-1 bg-green-400 rounded-full shadow-[0_0_8px_rgba(34,197,94,1)]" />
        )}
      </motion.div>
      
      {/* Tiny bright core */}
      <motion.div
        className="fixed top-0 left-0 z-[100000] pointer-events-none rounded-full mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          width: cursorState === 'evidence' ? 0 : 6,
          height: cursorState === 'evidence' ? 0 : 6,
          marginLeft: -3,
          marginTop: -3,
          background: '#FFFFFF',
          boxShadow: '0 0 10px rgba(255,255,255,0.8)',
          transition: 'width 0.1s, height 0.1s'
        }}
      />
    </>
  );
}
