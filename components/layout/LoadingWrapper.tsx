'use client';
import React, { useState, useEffect } from 'react';
import { LoadingScreen } from './LoadingScreen';

export function LoadingWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  // Prevent scrolling while loading
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [loading]);

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      <div style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.8s ease-out', visibility: loading ? 'hidden' : 'visible' }}>
        {children}
      </div>
    </>
  );
}
