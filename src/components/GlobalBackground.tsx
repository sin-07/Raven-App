'use client';

import React, { useEffect, useRef } from 'react';

export default function GlobalBackground() {
  const mouseLightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mouseLightRef.current;
    if (!el || typeof window === 'undefined') return;

    let ticking = false;
    let targetX = -500;
    let targetY = -500;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (el) {
            el.style.transform = `translate3d(${targetX - 250}px, ${targetY - 250}px, 0)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10 bg-[#07080c]"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      {/* ── 1. PRIMARY TOP EMERALD RADIAL CORONA ────────────────────── */}
      <div 
        className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1400px] h-[850px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.08) 35%, rgba(0, 229, 168, 0.03) 55%, transparent 75%)',
          transform: 'translate3d(0, 0, 0)',
        }}
      />

      {/* ── 2. MID-PAGE LEFT & RIGHT AMBIENT AURORAS ───────────────── */}
      <div 
        className="absolute top-[35%] -left-48 w-[700px] h-[700px] rounded-full opacity-80"
        style={{
          background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.04) 45%, transparent 70%)',
        }}
      />

      <div 
        className="absolute top-[45%] -right-48 w-[750px] h-[750px] rounded-full opacity-80"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 229, 168, 0.12) 0%, rgba(16, 185, 129, 0.04) 45%, transparent 70%)',
        }}
      />

      {/* ── 3. BOTTOM HORIZON AMBIENT GLOW ──────────────────────────── */}
      <div 
        className="absolute -bottom-36 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] rounded-full opacity-70"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.16) 0%, rgba(5, 150, 105, 0.05) 45%, transparent 75%)',
        }}
      />

      {/* ── 4. SUBTLE CURVED ORBIT LINES & FLOATING SVG PATHS ──────── */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-70"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="orbGrad1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="orbGrad2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Concentric Top Orbit Rings */}
        <ellipse cx="50%" cy="0" rx="650" ry="260" fill="none" stroke="#10B981" strokeWidth="1" strokeOpacity="0.15" strokeDasharray="4 8" />
        <ellipse cx="50%" cy="0" rx="980" ry="420" fill="none" stroke="#10B981" strokeWidth="1" strokeOpacity="0.1" />
        <ellipse cx="50%" cy="0" rx="1350" ry="580" fill="none" stroke="#34D399" strokeWidth="1" strokeOpacity="0.06" strokeDasharray="6 12" />

        {/* Dynamic Curved Flow Lines */}
        <path
          d="M -100 320 Q 400 140, 900 340 T 1900 280"
          fill="none"
          stroke="#10B981"
          strokeWidth="1"
          strokeOpacity="0.15"
          strokeLinecap="round"
        />
        <path
          d="M -100 580 Q 550 300, 1200 600 T 2100 520"
          fill="none"
          stroke="#34D399"
          strokeWidth="1"
          strokeOpacity="0.11"
          strokeLinecap="round"
        />

        {/* Floating Soft Ambient Circles */}
        <circle cx="12%" cy="25%" r="180" fill="url(#orbGrad1)" />
        <circle cx="88%" cy="55%" r="220" fill="url(#orbGrad2)" />
        <circle cx="50%" cy="85%" r="160" fill="url(#orbGrad1)" />
      </svg>

      {/* ── 5. SMOOTH INTERACTIVE MOUSE SPOTLIGHT (0 React Rerenders) ─ */}
      <div 
        ref={mouseLightRef}
        className="fixed w-[500px] h-[500px] rounded-full opacity-60 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.16) 0%, rgba(52, 211, 153, 0.04) 45%, transparent 70%)',
          transform: 'translate3d(-500px, -500px, 0)',
          willChange: 'transform',
        }}
      />

      {/* ── 6. TACTILE DOT MATRIX GRID ──────────────────────────────── */}
      <div 
        className="absolute inset-0 opacity-30" 
        style={{
          backgroundImage: 'radial-gradient(rgba(16, 185, 129, 0.12) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
}
