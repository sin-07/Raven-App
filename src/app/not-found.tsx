'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    targetRef.current = {
      x: (e.clientX / window.innerWidth - 0.5) * 20,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    };
  }, []);

  useEffect(() => {
    setIsLoaded(true);
    
    // Ultra-smooth lerp with RAF
    const animate = () => {
      setMousePosition(prev => ({
        x: prev.x + (targetRef.current.x - prev.x) * 0.08,
        y: prev.y + (targetRef.current.y - prev.y) * 0.08,
      }));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  // Memoize particles to prevent re-renders
  const particles = useMemo(() => 
    [...Array(6)].map((_, i) => (
      <div
        key={i}
        className="particle"
        style={{
          left: `${15 + i * 14}%`,
          animationDelay: `${i * 2.5}s`,
        }}
      />
    )), []);

  return (
    <div className="not-found-page">
      <style jsx>{`
        /* ================================================================
           ELEGANT ULTRA-SMOOTH 404 PAGE
           ================================================================ */

        .not-found-page {
          min-height: 100vh;
          background: #000;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Base GPU Layer */
        .gpu {
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        /* ==================== AMBIENT BACKGROUND ==================== */
        
        .ambient-bg {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse 80% 50% at 50% 120%, rgba(0, 229, 168, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 20% 20%, rgba(0, 229, 168, 0.05) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 30%, rgba(0, 179, 134, 0.04) 0%, transparent 35%),
            #000;
        }

        /* Elegant Stars */
        .stars {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 40% 70%, rgba(0,229,168,0.4), transparent),
            radial-gradient(1.5px 1.5px at 60% 20%, rgba(255,255,255,0.4), transparent),
            radial-gradient(1px 1px at 80% 60%, rgba(0,229,168,0.3), transparent),
            radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 90% 40%, rgba(255,255,255,0.4), transparent);
        }

        /* Soft Glow Orbs */
        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.4;
          animation: orbPulse 8s ease-in-out infinite;
        }

        .glow-orb-1 {
          width: 400px;
          height: 400px;
          background: rgba(0, 229, 168, 0.15);
          top: -200px;
          left: -100px;
        }

        .glow-orb-2 {
          width: 300px;
          height: 300px;
          background: rgba(0, 179, 134, 0.12);
          bottom: -150px;
          right: -50px;
          animation-delay: -4s;
        }

        @keyframes orbPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }

        /* ==================== ELEGANT GRID ==================== */
        
        .grid-wrapper {
          position: absolute;
          bottom: 0;
          left: -25%;
          right: -25%;
          height: 45%;
          perspective: 600px;
          overflow: hidden;
          mask-image: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 70%);
        }

        .grid-plane {
          position: absolute;
          width: 150%;
          height: 200%;
          left: -25%;
          background: 
            linear-gradient(90deg, rgba(0, 229, 168, 0.04) 1px, transparent 1px),
            linear-gradient(0deg, rgba(0, 229, 168, 0.04) 1px, transparent 1px);
          background-size: 80px 80px;
          transform: rotateX(70deg) translateY(-50%);
          animation: gridFlow 40s linear infinite;
        }

        @keyframes gridFlow {
          from { background-position: 0 0; }
          to { background-position: 80px 80px; }
        }

        /* ==================== CENTRAL ORB ==================== */
        
        .central-orb {
          position: absolute;
          width: 280px;
          height: 280px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, 
            rgba(0, 229, 168, 0.08) 0%, 
            transparent 60%
          );
          border: 1px solid rgba(0, 229, 168, 0.1);
          animation: centralPulse 4s ease-in-out infinite;
        }

        .central-orb::before {
          content: '';
          position: absolute;
          inset: 30px;
          border-radius: 50%;
          border: 1px solid rgba(0, 229, 168, 0.15);
          animation: ringRotate 20s linear infinite;
        }

        .central-orb::after {
          content: '';
          position: absolute;
          inset: 60px;
          border-radius: 50%;
          border: 1px solid rgba(0, 229, 168, 0.2);
          animation: ringRotate 15s linear infinite reverse;
        }

        @keyframes centralPulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.02); }
        }

        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ==================== FLOATING ELEMENTS ==================== */
        
        .float-element {
          position: absolute;
          border: 1px solid rgba(0, 229, 168, 0.2);
          animation: floatUpDown 6s ease-in-out infinite;
        }

        .float-diamond {
          width: 20px;
          height: 20px;
          transform: rotate(45deg);
          top: 25%;
          left: 15%;
        }

        .float-circle {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          top: 30%;
          right: 18%;
          animation-delay: -2s;
        }

        .float-square {
          width: 16px;
          height: 16px;
          bottom: 35%;
          left: 12%;
          animation-delay: -4s;
        }

        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0) rotate(45deg); opacity: 0.4; }
          50% { transform: translateY(-15px) rotate(45deg); opacity: 0.7; }
        }

        /* ==================== 404 TEXT ==================== */
        
        .text-3d-wrapper {
          perspective: 1000px;
        }

        .text-404 {
          font-size: clamp(90px, 20vw, 220px);
          font-weight: 900;
          letter-spacing: -8px;
          line-height: 1;
          background: linear-gradient(180deg, 
            #00FFD4 0%, 
            #00E5A8 40%, 
            #00B386 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          position: relative;
          text-shadow: 0 0 60px rgba(0, 229, 168, 0.4);
          animation: textGlow 3s ease-in-out infinite;
        }

        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 60px rgba(0, 229, 168, 0.3); }
          50% { text-shadow: 0 0 80px rgba(0, 229, 168, 0.5); }
        }

        /* Elegant Sweep */
        .sweep-line {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.05) 50%,
            transparent 100%
          );
          animation: sweepAcross 4s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes sweepAcross {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }

        /* ==================== PARTICLES ==================== */
        
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #00E5A8;
          border-radius: 50%;
          opacity: 0;
          animation: particleFloat 20s linear infinite;
        }

        @keyframes particleFloat {
          0% { transform: translateY(100vh); opacity: 0; }
          5% { opacity: 0.6; }
          95% { opacity: 0.6; }
          100% { transform: translateY(-10vh); opacity: 0; }
        }

        /* ==================== BUTTONS ==================== */
        
        .btn-elegant {
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-elegant::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .btn-elegant:hover::before {
          transform: translateX(100%);
        }

        .btn-elegant:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0, 229, 168, 0.3);
        }

        /* ==================== ENTRANCE ==================== */
        
        .entrance-main {
          animation: entranceMain 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes entranceMain {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        .entrance-sub {
          opacity: 0;
          animation: entranceSub 0.8s ease-out forwards;
          animation-delay: 0.2s;
        }

        @keyframes entranceSub {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .entrance-btns {
          opacity: 0;
          animation: entranceSub 0.8s ease-out forwards;
          animation-delay: 0.4s;
        }

        /* ==================== CORNERS ==================== */
        
        .corner {
          position: absolute;
          width: 60px;
          height: 60px;
          opacity: 0.15;
        }

        .corner-line {
          stroke: #00E5A8;
          stroke-width: 1;
          fill: none;
        }

        /* Vignette */
        .vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.5) 100%);
          pointer-events: none;
        }
      `}</style>

      {/* Background Layers */}
      <div className="ambient-bg" />
      <div className="stars" />
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />
      
      {/* Grid */}
      <div className="grid-wrapper">
        <div className="grid-plane gpu" />
      </div>

      {/* Central Orb */}
      <div className="central-orb gpu" />

      {/* Floating Elements */}
      <div className="float-element float-diamond" />
      <div className="float-element float-circle" />
      <div className="float-element float-square" />

      {/* Particles */}
      {particles}

      <div className="vignette" />

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        
        {/* Brand Logo */}
        <div className={`flex justify-center mb-6 ${isLoaded ? 'entrance-sub' : 'opacity-0'}`}>
          <Link href="/" className="inline-flex items-center gap-2.5 group p-2.5 px-4 rounded-full bg-white/5 border border-white/10 hover:border-emerald-500/30 backdrop-blur-md transition-all">
            <img 
              src="/logo.png" 
              alt="RAVEN Logo" 
              className="h-8 w-8 object-contain group-hover:scale-105 transition-transform" 
            />

            <div className="flex items-baseline gap-1 font-outfit">
              <span className="text-white font-black text-xl tracking-tight">RAVEN</span>
              <span className="text-[#00E5A8] font-bold text-sm tracking-widest uppercase">Tutorials</span>
            </div>
          </Link>
        </div>

        {/* 404 Text */}
        <div 
          className={`text-3d-wrapper mb-8 ${isLoaded ? 'entrance-main' : 'opacity-0'}`}
          style={{
            transform: `rotateX(${mousePosition.y * 0.1}deg) rotateY(${mousePosition.x * 0.1}deg)`,
          }}
        >
          <h1 className="text-404">
            404
            <div className="sweep-line" />
          </h1>
        </div>

        {/* Text Content */}
        <div className={`space-y-3 mb-12 ${isLoaded ? 'entrance-sub' : 'opacity-0'}`}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight">
            Page <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5A8] to-[#00FFD4]">Not Found</span>
          </h2>
          <p className="text-gray-400/80 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back home.
          </p>
        </div>

        {/* Buttons */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${isLoaded ? 'entrance-btns' : 'opacity-0'}`}>
          <Link
            href="/"
            className="btn-elegant group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00E5A8] to-[#00B386] text-black font-semibold rounded-xl"
          >
            <Home className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <span>Return Home</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn-elegant group flex items-center gap-3 px-8 py-4 bg-white/5 text-white font-semibold rounded-xl border border-white/10 hover:border-[#00E5A8]/50 hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Go Back</span>
          </button>
        </div>
      </div>

      {/* Corners */}
      <svg className="corner absolute top-6 left-6" viewBox="0 0 60 60">
        <path className="corner-line" d="M0,20 L0,0 L20,0" />
      </svg>
      <svg className="corner absolute top-6 right-6" viewBox="0 0 60 60">
        <path className="corner-line" d="M40,0 L60,0 L60,20" />
      </svg>
      <svg className="corner absolute bottom-6 left-6" viewBox="0 0 60 60">
        <path className="corner-line" d="M0,40 L0,60 L20,60" />
      </svg>
      <svg className="corner absolute bottom-6 right-6" viewBox="0 0 60 60">
        <path className="corner-line" d="M40,60 L60,60 L60,40" />
      </svg>
    </div>
  );
}

