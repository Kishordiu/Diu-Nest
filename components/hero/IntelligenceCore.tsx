'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiuNestMark } from '../brand/DiuNestMark';

const NODES = [
  { id: 'requirement', label: 'REQUIREMENT', angle: -90, info: 'Natural language → spec', desc: 'Parse any procurement need' },
  { id: 'supplier', label: 'SUPPLIER', angle: -30, info: 'Live web discovery', desc: 'Real suppliers from the web' },
  { id: 'quotation', label: 'QUOTATION', angle: 30, info: 'Document extraction', desc: 'PDF / image → structured data' },
  { id: 'evidence', label: 'EVIDENCE', angle: 90, info: 'Source verification', desc: 'Every claim traced to origin' },
  { id: 'risk', label: 'RISK', angle: 150, info: 'Evidence-derived', desc: 'Real gaps, not random scores' },
  { id: 'decision', label: 'DECISION', angle: 210, info: 'Deterministic engine', desc: 'Weighted scoring, transparent' },
];

export function IntelligenceCore() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [pulseIndex, setPulseIndex] = useState(0);

  const SIZE = 480;
  const CENTER = SIZE / 2;
  const RADIUS = 170;

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex(prev => (prev + 1) % NODES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = (e.clientX - rect.left - CENTER) / CENTER;
    const dy = (e.clientY - rect.top - CENTER) / CENTER;
    setMouseOffset({ x: dx * 8, y: dy * 8 });
  };

  const getPos = (angle: number, r = RADIUS) => ({
    x: CENTER + r * Math.cos((angle * Math.PI) / 180),
    y: CENTER + r * Math.sin((angle * Math.PI) / 180),
  });

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      style={{ width: SIZE, height: SIZE }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setMouseOffset({ x: 0, y: 0 }); setHoveredNode(null); }}
    >
      {/* Ambient glow behind */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(57,255,136,0.06) 0%, transparent 65%)',
        }}
      />

      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0"
      >
        {/* Outer ring faint */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS + 20} stroke="rgba(57,255,136,0.04)" strokeWidth="1" fill="none" />
        <circle cx={CENTER} cy={CENTER} r={RADIUS - 20} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" fill="none" strokeDasharray="4 8" />

        {/* Adjacency lines between nodes */}
        {NODES.map((node, i) => {
          const next = NODES[(i + 1) % NODES.length];
          const p1 = getPos(node.angle);
          const p2 = getPos(next.angle);
          return (
            <motion.line
              key={`adj-${i}`}
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="0.75"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 + i * 0.15 }}
            />
          );
        })}

        {/* Spoke lines from center to nodes */}
        {NODES.map((node, i) => {
          const pos = getPos(node.angle);
          const isHovered = hoveredNode === node.id;
          const isPulsing = pulseIndex === i;
          return (
            <g key={`spoke-${i}`}>
              <motion.line
                x1={CENTER} y1={CENTER} x2={pos.x} y2={pos.y}
                stroke={isHovered ? '#39FF88' : isPulsing ? 'rgba(57,255,136,0.4)' : 'rgba(255,255,255,0.08)'}
                strokeWidth={isHovered ? 1.5 : 0.75}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.12, duration: 1, ease: 'easeOut' }}
                style={{ transition: 'stroke 300ms ease, stroke-width 300ms ease' }}
              />
              {/* Data pulse traveling along spoke */}
              {isPulsing && (
                <motion.circle
                  r={2.5}
                  fill="#39FF88"
                  style={{ boxShadow: '0 0 8px #39FF88' }}
                  initial={{ cx: CENTER, cy: CENTER, opacity: 0 }}
                  animate={{
                    cx: [CENTER, pos.x, CENTER],
                    cy: [CENTER, pos.y, CENTER],
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 1.4, ease: 'easeInOut' }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Center mark - moves with mouse */}
      <motion.div
        className="absolute"
        animate={{ x: mouseOffset.x, y: mouseOffset.y }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        style={{ left: CENTER - 36, top: CENTER - 36 }}
      >
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <DiuNestMark size={72} color="#39FF88" />
        </motion.div>
      </motion.div>

      {/* Node circles + labels */}
      {NODES.map((node, i) => {
        const pos = getPos(node.angle);
        const isHovered = hoveredNode === node.id;
        const labelPos = getPos(node.angle, RADIUS + 44);

        return (
          <motion.div
            key={node.id}
            className="absolute cursor-pointer"
            style={{
              left: pos.x - 14,
              top: pos.y - 14,
              width: 28,
              height: 28,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.12, type: 'spring', stiffness: 300, damping: 25 }}
            onHoverStart={() => setHoveredNode(node.id)}
            onHoverEnd={() => setHoveredNode(null)}
          >
            {/* Node circle */}
            <motion.div
              className="w-full h-full rounded-full border flex items-center justify-center"
              animate={{
                scale: isHovered ? 1.4 : [1, 1.06, 1],
                borderColor: isHovered ? 'rgba(57,255,136,0.8)' : 'rgba(57,255,136,0.3)',
                backgroundColor: isHovered ? 'rgba(57,255,136,0.15)' : 'rgba(11,19,43,0.8)',
              }}
              transition={isHovered ? { duration: 0.2 } : { duration: 3, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: '#39FF88',
                  boxShadow: isHovered ? '0 0 12px #39FF88' : '0 0 4px rgba(57,255,136,0.5)',
                }}
              />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Node labels */}
      {NODES.map((node, i) => {
        const labelPos = getPos(node.angle, RADIUS + 52);
        const isHovered = hoveredNode === node.id;
        const isRight = labelPos.x > CENTER + 10;
        const isLeft = labelPos.x < CENTER - 10;

        return (
          <motion.div
            key={`label-${node.id}`}
            className="absolute pointer-events-none text-center"
            style={{
              left: labelPos.x - 50,
              top: labelPos.y - 14,
              width: 100,
              textAlign: isRight ? 'left' : isLeft ? 'right' : 'center',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 + i * 0.1 }}
          >
            <div
              className="text-[8px] tracking-[0.2em] transition-colors"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                color: isHovered ? '#39FF88' : 'rgba(255,255,255,0.35)',
              }}
            >
              {node.label}
            </div>
          </motion.div>
        );
      })}

      {/* Tooltip on hover */}
      <AnimatePresence>
        {hoveredNode && (() => {
          const node = NODES.find(n => n.id === hoveredNode)!;
          return (
            <motion.div
              key="tooltip"
              className="absolute z-20 pointer-events-none"
              style={{
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="px-4 py-2 text-center"
                style={{
                  background: 'rgba(11,19,43,0.95)',
                  border: '1px solid rgba(57,255,136,0.3)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '2px',
                  minWidth: 160,
                }}
              >
                <div className="text-[9px] tracking-[0.2em] text-[#39FF88] mb-1" style={{fontFamily:'JetBrains Mono,monospace'}}>
                  {node.label}
                </div>
                <div className="text-white text-xs font-medium" style={{fontFamily:'JetBrains Mono,monospace'}}>
                  {node.info}
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
