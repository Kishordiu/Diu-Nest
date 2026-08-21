'use client';
import React from 'react';
import { DiuNestMark } from './DiuNestMark';

interface DiuNestLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'stacked';
  className?: string;
  color?: string;
}

const sizeConfig = {
  sm: { markSize: 18, textClass: 'text-sm', gap: 'gap-2' },
  md: { markSize: 24, textClass: 'text-base', gap: 'gap-3' },
  lg: { markSize: 36, textClass: 'text-xl', gap: 'gap-3' },
  xl: { markSize: 52, textClass: 'text-3xl', gap: 'gap-4' },
};

export function DiuNestLogo({ size = 'md', layout = 'horizontal', className = '', color }: DiuNestLogoProps) {
  const { markSize, textClass, gap } = sizeConfig[size];
  const isStacked = layout === 'stacked';

  return (
    <div className={`flex ${isStacked ? 'flex-col items-center' : 'flex-row items-center'} ${gap} ${className}`}>
      <DiuNestMark size={markSize} color={color || '#39FF88'} />
      <span
        className={`font-bold tracking-[0.15em] ${textClass}`}
        style={{ fontFamily: 'Cinzel Decorative, serif', color: color || 'white' }}
      >
        DIU NEST
      </span>
    </div>
  );
}
