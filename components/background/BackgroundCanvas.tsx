'use client';

import React, { useEffect, useRef } from 'react';

export function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('resize', resize);
    resize();

    // Architectural grid parameters
    const gridSize = 100;
    
    const render = () => {
      // Very deep architectural navy
      ctx.fillStyle = '#090e17';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 1;
      
      // Draw very faint grid (architectural blueprint feel)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Subtle vignette
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height)
      );
      gradient.addColorStop(0, 'rgba(9, 14, 23, 0)');
      gradient.addColorStop(1, 'rgba(5, 8, 12, 0.8)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    render();
    
    // We don't need continuous animation for a static grid, saving CPU.
    // If we wanted to animate a scanning line, we could add a slow requestAnimationFrame loop here.

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  );
}
