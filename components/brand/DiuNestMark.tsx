'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface DiuNestMarkProps {
  size?: number;
  className?: string;
  animated?: boolean;
  color?: string;
}

export function DiuNestMark({ size = 32, className = '', animated = false, color = 'currentColor' }: DiuNestMarkProps) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  // Architectural / Crystal / Nest symbol
  // Composed of interlocking precise geometric folds
  
  const lineWeight = s * 0.05;
  
  const PathEl = animated ? motion.path : 'path';
  const animProps = animated ? {
    animate: { opacity: [0.6, 1, 0.6] },
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const }
  } : {};

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="DIU NEST mark"
    >
      {/* Outer framing - architectural curves */}
      <path 
        d={`M ${s*0.2} ${s*0.8} Q ${s*0.5} ${s*0.95} ${s*0.8} ${s*0.8} L ${s*0.85} ${s*0.4} Q ${s*0.5} ${s*0.1} ${s*0.15} ${s*0.4} Z`}
        stroke={color} 
        strokeWidth={lineWeight * 0.5} 
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />
      
      {/* Structural inner folds */}
      <path 
        d={`M ${s*0.3} ${s*0.7} L ${s*0.5} ${s*0.8} L ${s*0.7} ${s*0.7} L ${s*0.65} ${s*0.3} L ${s*0.5} ${s*0.2} L ${s*0.35} ${s*0.3} Z`}
        stroke={color} 
        strokeWidth={lineWeight} 
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />

      {/* Interconnecting evidence lines */}
      <path 
        d={`M ${s*0.5} ${s*0.2} L ${s*0.5} ${s*0.8}`}
        stroke={color} 
        strokeWidth={lineWeight * 0.75} 
        strokeDasharray={`${s*0.05} ${s*0.08}`}
        opacity="0.8"
      />

      <path 
        d={`M ${s*0.35} ${s*0.3} L ${s*0.65} ${s*0.7}`}
        stroke={color} 
        strokeWidth={lineWeight * 0.5} 
        opacity="0.5"
      />

      {/* The Central Decision Node (The "Nest" core) */}
      <PathEl 
        d={`M ${s*0.45} ${s*0.45} L ${s*0.55} ${s*0.45} L ${s*0.5} ${s*0.55} Z`}
        fill={color}
        {...animProps}
      />
    </svg>
  );
}
