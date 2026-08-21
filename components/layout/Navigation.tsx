'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DiuNestMark } from '../brand/DiuNestMark';
import Link from 'next/link';

const links = ['Architecture', 'Evidence', 'Mission'];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="transition-all duration-500 rounded-b-2xl"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(24,25,34,0.06)' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.04)' : 'none',
        }}
      >
        <div className="flex items-center justify-between h-16 max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" data-cursor="cta">
            <DiuNestMark size={22} color="#6C63FF" />
            <span className="font-display font-semibold tracking-[0.08em] text-[#181922] group-hover:text-[#6C63FF] transition-colors text-sm">
              DIU NEST
            </span>
          </Link>

          {/* Center links (desktop) */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link, i) => (
              <motion.a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-[#7A7F8D] hover:text-[#181922] transition-colors text-xs tracking-[0.12em] font-mono"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
              >
                {link.toUpperCase()}
              </motion.a>
            ))}
          </div>

          {/* Right CTA (desktop) */}
          <motion.div
            className="hidden md:flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link
              href="/mission"
              className="btn-signature text-xs tracking-[0.1em] uppercase font-semibold !py-2.5 !px-5 !text-[11px]"
              data-cursor="cta"
            >
              Start Mission
            </Link>
          </motion.div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-[#7A7F8D] hover:text-[#181922] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              {mobileOpen ? (
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              ) : (
                <>
                  <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu — white bg, dark text */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden py-4 space-y-2 rounded-b-2xl"
          style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}
        >
          {links.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`}
              className="block px-4 py-2 text-[#7A7F8D] hover:text-[#181922] text-xs tracking-widest font-mono transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.toUpperCase()}
            </a>
          ))}
          <Link href="/mission"
            className="block px-4 py-2 text-[#6C63FF] text-xs tracking-widest font-mono font-semibold"
          >
            START MISSION &rarr;
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
}
