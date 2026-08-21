import React from 'react';
import { motion } from 'framer-motion';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassPanel({
  children,
  className = '',
  glow = false,
  hover = false,
  onClick
}: GlassPanelProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-[#0B132B]/70
        border border-[#39FF88]/12
        backdrop-blur-[20px]
        transition-all duration-200
        ${glow ? 'shadow-[0_0_40px_rgba(57,255,136,0.08)]' : ''}
        ${hover ? 'hover:border-[#39FF88]/40 hover:shadow-[0_0_20px_rgba(57,255,136,0.1)]' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
