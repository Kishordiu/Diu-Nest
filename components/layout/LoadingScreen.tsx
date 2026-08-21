'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // 0: Initial wait
    // 1: Show text
    // 2: Complete
    const t1 = setTimeout(() => setStage(1), 500);
    const t2 = setTimeout(() => {
      setStage(2);
      setTimeout(onComplete, 800); // Wait for exit animation
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage < 2 && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[99999] bg-[#FBFBF8] flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col items-center">
            {/* Minimal loader animation */}
            <motion.div 
              className="w-12 h-12 rounded-full border border-[#181922]/10 mb-8 relative flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <motion.div 
                className="w-2 h-2 bg-[#6C63FF] rounded-full absolute"
                animate={{ 
                  rotate: 360,
                  transformOrigin: '0 24px'
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ top: 0, left: 23 }}
              />
              <div className="w-1.5 h-1.5 bg-[#181922] rounded-full" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: stage >= 1 ? 1 : 0, y: stage >= 1 ? 0 : 10 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="font-display font-semibold tracking-[0.15em] text-[#181922] text-sm uppercase mb-3">
                DIU NEST
              </div>
              <div className="font-mono text-[#969AA6] text-[10px] tracking-widest uppercase">
                Initializing Intelligence Core
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
