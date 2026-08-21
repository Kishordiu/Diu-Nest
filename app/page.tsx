'use client';
import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Navigation } from '@/components/layout/Navigation';
import { HeroSection } from '@/components/hero/HeroSection';
import Link from 'next/link';

function FadeInSection({ children, delay = 0, yOffset = 30 }: { children: React.ReactNode; delay?: number, yOffset?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

const CAROUSEL_MOCK = [
  { supplier: "TechCorp Logistics", location: "Global", product: "Server Rack XL", signal: "VERIFIED SLA", img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800" },
  { supplier: "MedEquip Direct", location: "Mumbai, IN", product: "PT100 Temperature Sensor", signal: "IN STOCK", img: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=800" },
  { supplier: "Apex Industrials", location: "Berlin, DE", product: "Precision Valve V2", signal: "ISO 9001", img: "https://images.unsplash.com/photo-1611078730998-d1a84f3df997?auto=format&fit=crop&q=80&w=800" },
  { supplier: "Nexus Systems", location: "Austin, TX", product: "Network Switch Pro", signal: "10% PRICE DROP", img: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800" }
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <main className="min-h-screen text-text bg-base relative overflow-hidden">
      {/* Global Light Aurora Environment */}
      <div className="fixed inset-0 pointer-events-none z-0 mix-blend-multiply opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-aurora-2 blur-[100px] opacity-20 animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-aurora-1 blur-[120px] opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-aurora-5 blur-[100px] opacity-10 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <Navigation />
      
      {/* SCENE 01 Ã¢â‚¬â€ HERO */}
      <HeroSection />

      {/* SCENE 02 Ã¢â‚¬â€ PROBLEM */}
      <section className="py-32 relative z-10">
        <div className="container-diu">
          <FadeInSection>
            <div className="max-w-4xl mx-auto text-center">
              <p className="label-meta text-muted-grey mb-8">THE PROBLEM</p>
              <h2 className="headline-massive mb-8 tracking-tight">
                PROCUREMENT DECISIONS ARE MADE ON <span className="text-muted-grey">INCOMPLETE</span> INFORMATION.
              </h2>
              <p className="font-sans font-light text-text/60 text-xl leading-relaxed max-w-2xl mx-auto">
                Teams compare prices without verifying sources, calculate total cost without hidden fees, and accept claims without evidence.
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* SCENE 03 Ã¢â‚¬â€ REQUIREMENT */}
      <section className="py-32 relative z-10 border-t border-text/5">
        <div className="container-diu">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <FadeInSection>
              <div className="max-w-xl">
                <p className="label-meta text-aurora-1 mb-6">STEP 01 // REQUIREMENT</p>
                <h2 className="text-display text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                  State your intent naturally.
                </h2>
                <p className="font-sans text-lg text-text/60 leading-relaxed mb-8">
                  Stop filling out complex specification forms. Describe what you need in plain language. Our deterministic compiler transforms your intent into strict technical constraints without hallucination.
                </p>
                <div className="flex gap-4">
                  <div className="text-[10px] font-mono tracking-widest bg-white border border-text/10 px-4 py-2 rounded-full shadow-sm text-text/80">QTY: 500</div>
                  <div className="text-[10px] font-mono tracking-widest bg-white border border-text/10 px-4 py-2 rounded-full shadow-sm text-text/80">BUDGET: $50K</div>
                </div>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.2} yOffset={0}>
              <div className="liquid-glass-02 p-8 md:p-12 h-[400px] flex items-center justify-center relative overflow-hidden group">
                 <div className="text-2xl md:text-3xl font-serif text-text/80 italic leading-relaxed z-10 text-center max-w-sm relative">
                   &quot;I need 500 medical-grade temperature sensors for our Chennai facility within 10 days.&quot;
                   <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-12 h-1 bg-aurora-gradient rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* SCENE 04 & 05 Ã¢â‚¬â€ LIVE SUPPLY NETWORK & CAROUSEL */}
      <section className="py-32 relative z-10 bg-white/50 border-t border-text/5 overflow-hidden">
        <div className="container-diu mb-20">
          <FadeInSection>
            <div className="max-w-2xl">
              <p className="label-meta text-aurora-2 mb-6">STEP 02 // DISCOVERY</p>
              <h2 className="text-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Real suppliers. Live network.
              </h2>
              <p className="font-sans text-lg text-text/60 leading-relaxed">
                We don&apos;t search a stale internal database. DIU NEST scours the live web, extracts real product data, and verifies supplier certifications instantly.
              </p>
            </div>
          </FadeInSection>
        </div>

        {/* Horizontal Spatial Slider Teaser */}
        <div className="w-full pl-6 md:pl-12 lg:pl-24 flex gap-6 overflow-x-auto hide-scrollbar pb-12 snap-x snap-mandatory">
          {CAROUSEL_MOCK.map((card, i) => (
            <motion.div 
              key={i}
              className="snap-center shrink-0 w-[85vw] md:w-[400px] liquid-glass-02 overflow-hidden flex flex-col group cursor-grab active:cursor-grabbing"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8 }}
            >
              <div className="h-64 w-full bg-text/5 relative overflow-hidden">
                <img src={card.img} alt={card.product} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-mono tracking-widest text-text shadow-sm">
                  {card.signal}
                </div>
              </div>
              <div className="p-6 bg-white">
                <h3 className="font-display font-semibold text-xl mb-1">{card.supplier}</h3>
                <p className="text-text/50 font-sans text-sm mb-4">{card.location}</p>
                <div className="w-full h-px bg-text/5 mb-4" />
                <p className="font-mono text-xs text-text/80">{card.product}</p>
              </div>
            </motion.div>
          ))}
          <div className="shrink-0 w-12 md:w-24" /> {/* spacer */}
        </div>
      </section>

      {/* SCENE 06 Ã¢â‚¬â€ REAL QUOTATION */}
      <section className="py-32 relative z-10 border-t border-text/5">
        <div className="container-diu">
           <div className="flex flex-col-reverse md:flex-row gap-20 items-center">
            <FadeInSection delay={0.2} yOffset={0}>
              <div className="relative w-full max-w-md mx-auto group perspective-[1000px]">
                <div className="absolute inset-0 bg-aurora-3 blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
                {/* Paper document representation */}
                <div className="liquid-glass-03 bg-white p-8 md:p-12 shadow-[0_32px_64px_rgba(0,0,0,0.08)] transform rotate-y-[-5deg] rotate-x-[5deg] group-hover:rotate-0 transition-transform duration-700">
                  <div className="w-full h-8 bg-text/5 mb-8 flex justify-between items-center px-4">
                     <div className="w-20 h-2 bg-text/10 rounded-full" />
                     <div className="w-8 h-2 bg-text/10 rounded-full" />
                  </div>
                  <div className="space-y-4 mb-12">
                    <div className="w-full h-3 bg-text/5 rounded-full" />
                    <div className="w-5/6 h-3 bg-text/5 rounded-full" />
                    <div className="w-4/6 h-3 bg-text/5 rounded-full" />
                  </div>
                  <div className="border-t border-text/10 pt-6 mt-12 flex justify-between">
                    <span className="font-mono text-xs text-text/50">TOTAL AMOUNT</span>
                    <span className="font-mono font-bold text-lg text-text">$52,400.00</span>
                  </div>
                </div>
              </div>
            </FadeInSection>
            <FadeInSection>
              <div className="max-w-xl">
                <p className="label-meta text-aurora-3 mb-6">STEP 03 // INGESTION</p>
                <h2 className="text-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
                  Documents become data.
                </h2>
                <p className="font-sans text-lg text-text/60 leading-relaxed">
                  Upload quotations or let the system extract them from the web. Every critical fieldÃ¢â‚¬â€unit price, taxes, shipping, SLAÃ¢â‚¬â€is pulled directly from the paper and mapped to the decision engine.
                </p>
              </div>
            </FadeInSection>
           </div>
        </div>
      </section>

      {/* SCENE 07 & 08 Ã¢â‚¬â€ EVIDENCE & DECISION */}
      <section className="py-32 relative z-10 bg-white border-t border-text/5">
        <div className="container-diu text-center max-w-4xl mx-auto mb-20">
          <FadeInSection>
            <p className="label-meta text-aurora-4 mb-6">STEP 04 // DECISION ENGINE</p>
            <h2 className="text-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Every claim has a trail.
            </h2>
            <p className="font-sans text-lg text-text/60 leading-relaxed">
              If we can&apos;t verify it, we don&apos;t pretend to know it. The decision engine pits an Advocate (why this fits) against a Challenger (what could go wrong), leaving you with a purely evidence-weighted recommendation.
            </p>
          </FadeInSection>
        </div>

        <div className="container-diu">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['PRICE DELTA', 'DELIVERY RISK', 'CERTIFICATION'].map((claim, i) => (
              <FadeInSection key={claim} delay={i * 0.1}>
                <div className="p-8 liquid-glass-02 bg-base/50 hover:bg-base transition-colors group">
                  <div className="flex justify-between items-center mb-12">
                    <div className="font-mono text-xs font-semibold text-text tracking-widest">{claim}</div>
                    <div className="w-2 h-2 rounded-full bg-aurora-4 group-hover:scale-150 transition-transform" />
                  </div>
                  <div className="font-sans text-sm text-text/60 leading-relaxed mb-6">
                    Cross-referenced against 14 live market sources and historical supply chain latency models.
                  </div>
                  <div className="text-[10px] font-mono tracking-widest text-aurora-4 uppercase">View Trail Ã¢â€ â€™</div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* SCENE 09 & 10 Ã¢â‚¬â€ HUMAN CONTROL & FINAL CTA */}
      <section className="py-40 relative z-10 border-t border-text/5 overflow-hidden">
        <div className="absolute inset-0 bg-aurora-light opacity-50 z-0" />
        <div className="container-diu text-center relative z-10">
          <FadeInSection>
            <div className="max-w-3xl mx-auto flex flex-col items-center">
              <p className="label-meta text-text/60 mb-6">HUMAN IN THE LOOP</p>
              <h2 className="text-display text-5xl md:text-7xl font-bold tracking-tight mb-10 text-text">
                YOU MAKE THE CALL.
              </h2>
              <p className="font-sans text-xl text-text/70 leading-relaxed mb-16 max-w-2xl">
                The firewall blocks non-compliant options. The digital twin simulates the outcome. You authorize the final purchase order.
              </p>
              <Link href="/mission" className="btn-signature">
                <span>START A PROCUREMENT MISSION</span>
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-text/10 py-10 relative z-10 bg-white">
        <div className="container-diu flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-text font-display text-sm font-bold tracking-[0.1em]">
            DIU NEST
          </div>
          <div className="flex gap-8">
            {['Architecture', 'Evidence', 'Mission', 'Audit'].map((link) => (
              <a key={link} href="#" className="font-sans font-medium text-text/40 hover:text-text/80 text-[11px] tracking-[0.08em] uppercase transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
