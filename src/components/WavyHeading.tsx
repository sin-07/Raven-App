'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

interface WavyHeadingProps {
  children?: React.ReactNode;
  text?: string;
  gradientText?: string;
  gradientClassName?: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  continuous?: boolean;
}

export default function WavyHeading({
  children,
  text,
  gradientText,
  gradientClassName = 'text-gradient-emerald',
  className = 'text-4xl sm:text-6xl font-black text-white font-outfit tracking-tight leading-[1.1]',
  as: Component = 'h1',
}: WavyHeadingProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = headingRef.current;
    if (!el || typeof window === 'undefined') return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const words = el.querySelectorAll('.wavy-word');
    if (!words.length) return;

    // Use IntersectionObserver to ONLY animate when heading scrolls into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Silky smooth, hardware-accelerated fluid wave animation
            gsap.fromTo(
              words,
              {
                opacity: 0,
                y: 24,
                scale: 0.94,
              },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                stagger: 0.045,
                ease: 'power3.out',
                clearProps: 'transform,willChange',
              }
            );

            // Disconnect observer after single clean trigger
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [text, gradientText]);

  // Render text word by word for optimal kerning and high-speed GPU rendering
  const renderWords = (str: string, extraClass = '') => {
    return str.split(' ').map((word, i) => (
      <span
        key={i}
        className={`wavy-word inline-block mr-[0.25em] last:mr-0 will-change-transform ${extraClass}`}
      >
        {word}
      </span>
    ));
  };

  return (
    <Component ref={headingRef} className={`relative text-center ${className}`}>
      {text && renderWords(text)}
      {gradientText && (
        <span className={gradientClassName}>
          {renderWords(gradientText, gradientClassName)}
        </span>
      )}
      {children}
    </Component>
  );
}
