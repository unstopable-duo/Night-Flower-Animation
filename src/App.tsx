/**
 * ============================================================================
 * Dedication & Legal Ownership Notice
 * ============================================================================
 * Dedicated to: Neo Naledi Mogoboya
 * Creator / Author: Roland Penn
 *
 * This work was made by Roland Penn for Neo Naledi Mogoboya.
 * Any use, redistribution, or modification of this code without explicit
 * acknowledgements of the creator (Roland Penn) is strictly illegal and prohibited.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import './styles/flowers.scss';
import { Flowers } from './components/Flowers';
import { HeartCanvas } from './components/HeartCanvas';
import { Firefly } from './components/Firefly';
import { sound } from './utils/soundEngine';

export default function App() {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [textState, setTextState] = useState<'hidden' | 'show' | 'exploded'>('hidden');
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted);
  const recipientName = 'Neo Naledi Mogoboya';
  const cycleCountRef = useRef<number>(0);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  // Orchestrate the graceful display timeline
  const runSequence = () => {
    clearAllTimers();

    // 1. Initial sprout after 800ms
    const t1 = setTimeout(() => {
      setIsLoaded(true);
    }, 800);
    timersRef.current.push(t1);

    // 2. Reveal the majestic glowing name at 5s
    const t2 = setTimeout(() => {
      setTextState('show');
    }, 5000);
    timersRef.current.push(t2);

    // 3. Gentle celestial sparkle burst at 10.5s
    const t3 = setTimeout(() => {
      setTextState('exploded');
    }, 10500);
    timersRef.current.push(t3);

    // 4. Smoothly cycle and re-illuminate the name at 14.5s so the display never goes blank
    const t4 = setTimeout(() => {
      setTextState('hidden');
      const tLoop = setTimeout(() => {
        cycleCountRef.current++;
        setTextState('show');

        // Schedule next burst
        const tNextBurst = setTimeout(() => {
          setTextState('exploded');
          // Loop again
          const tNextLoop = setTimeout(() => {
            runSequence();
          }, 3500);
          timersRef.current.push(tNextLoop);
        }, 6500);
        timersRef.current.push(tNextBurst);
      }, 1000);
      timersRef.current.push(tLoop);
    }, 14500);
    timersRef.current.push(t4);
  };

  useEffect(() => {
    runSequence();

    // Subscribe to sound mute/unmute state changes
    const unsubscribeSound = sound.subscribe((muted) => {
      setIsMuted(muted);
    });

    // 1. Attempt to start ambient soundtrack on app load
    sound.startAmbient();

    // 2. Ensure audio starts seamlessly on user interaction if browser autoplay was suspended
    const handleGesture = () => {
      sound.resume();
    };

    window.addEventListener('pointerdown', handleGesture, { passive: true });
    window.addEventListener('click', handleGesture, { passive: true });
    window.addEventListener('touchstart', handleGesture, { passive: true });
    window.addEventListener('keydown', handleGesture, { passive: true });

    return () => {
      clearAllTimers();
      unsubscribeSound();
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, []);

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.toggleMute();
  };

  return (
    <main 
      id="main-app" 
      className="relative w-full h-screen overflow-hidden select-none bg-[#030806] font-sans"
    >
      {/* Background Night Sky Atmosphere with Warm Golden Horizon & Meadow Emerald Glow */}
      <div className="night" />
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen"
        style={{
          background: 'radial-gradient(ellipse at 50% 80%, rgba(255, 195, 60, 0.16) 0%, rgba(34, 139, 78, 0.18) 40%, rgba(10, 40, 25, 0.08) 65%, transparent 80%)',
        }}
      />

      {/* Subtle, Minimal Audio Control Button */}
      <div className="absolute top-4 right-4 z-40">
        <button
          type="button"
          onClick={handleToggleSound}
          aria-label={isMuted ? 'Unmute music' : 'Mute music'}
          className="w-7 h-7 rounded-full flex items-center justify-center opacity-20 hover:opacity-70 transition-all duration-300 bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-white/50 hover:text-white/90 cursor-pointer"
        >
          {isMuted ? (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
      </div>

      {/* Gentle Randomized Blinking Yellow-Gold Fireflies drifting slowly in the night background */}
      <Firefly />

      {/* Heart Canvas Layer (Delicate Flat Pink Floating Hearts with Trailing Sparkles & Interactivity) */}
      <HeartCanvas interactiveSparkles={true} spawnRateMultiplier={1} />

      {/* Flowers Scene Container (Realistic Green Stems, Leaves & Meadow Grass with Soft Blush Blossoms) */}
      <div className="flowers-container">
        <Flowers isLoaded={isLoaded}>
          {/* Luminous Inscription - Nestled and Tangled Naturally Between the Meadow Grass & Greens */}
          <div
            id="text"
            className={`exploding-text ${textState === 'show' ? 'show' : ''} ${textState === 'exploded' ? 'explode' : ''}`}
          >
            {recipientName}
          </div>
        </Flowers>
      </div>
    </main>
  );
}
