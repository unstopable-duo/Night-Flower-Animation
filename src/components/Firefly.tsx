/**
 * ============================================================================
 * Dedication & Legal Ownership Notice
 * ============================================================================
 * Created for: Neo Naledi Mogoboya
 * Made by: Roland Penn
 *
 * This component was made by Roland Penn for Neo Naledi Mogoboya.
 * Any use without acknowledgements of the creator is illegal.
 * ============================================================================
 */

import React, { useEffect, useRef } from 'react';

interface FireflyParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  phase: number;
  blinkSpeed: number;
  wanderAngle: number;
  wanderSpeed: number;
  depthAlpha: number;
}

export const Firefly: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const firefliesRef = useRef<FireflyParticle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Warm, ambient yellow-gold hues characteristic of summer fireflies
    const goldPalette = [
      { core: '#fffde7', glow: 'rgba(255, 235, 115, 0.7)' },
      { core: '#fff9c4', glow: 'rgba(255, 220, 80, 0.65)' },
      { core: '#ffe082', glow: 'rgba(255, 205, 60, 0.6)' },
      { core: '#ffd54f', glow: 'rgba(255, 190, 45, 0.6)' },
      { core: '#fff59d', glow: 'rgba(255, 240, 130, 0.7)' },
    ];

    // Initialize randomized blinking yellow-gold dots moving slowly across the background
    const count = 38;
    firefliesRef.current = Array.from({ length: count }).map((_, i) => {
      const palette = goldPalette[i % goldPalette.length];
      const depth = 0.5 + Math.random() * 0.5; // Depth multiplier
      return {
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height * 0.9), // distribute throughout night meadow height
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.2,
        baseRadius: (1.2 + Math.random() * 1.6) * depth,
        color: palette.core,
        glowColor: palette.glow,
        phase: Math.random() * Math.PI * 2,
        blinkSpeed: 0.018 + Math.random() * 0.035, // Slow, peaceful, randomized blinking
        wanderAngle: Math.random() * Math.PI * 2,
        wanderSpeed: 0.015 + Math.random() * 0.02,
        depthAlpha: 0.55 + depth * 0.45,
      };
    });

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;

      firefliesRef.current.forEach((fly) => {
        // 1. Organic, slow wandering trajectory (sinusoidal steering)
        fly.wanderAngle += (Math.random() - 0.5) * fly.wanderSpeed;
        const targetVx = Math.cos(fly.wanderAngle) * 0.35;
        const targetVy = Math.sin(fly.wanderAngle) * 0.25 - 0.04; // subtle gentle upward thermal tendency

        // Smooth velocity interpolation for graceful, lazy flight
        fly.vx += (targetVx - fly.vx) * 0.03;
        fly.vy += (targetVy - fly.vy) * 0.03;

        fly.x += fly.vx;
        fly.y += fly.vy;

        // Wrap boundaries seamlessly with buffer
        if (fly.x < -30) fly.x = width + 25;
        if (fly.x > width + 30) fly.x = -25;
        if (fly.y < -30) fly.y = height * 0.95;
        if (fly.y > height * 0.98) fly.y = -20;

        // 2. Randomized organic blinking cycle
        fly.phase += fly.blinkSpeed;
        // Non-linear pulse for natural bioluminescent firefly glow (steep peak, gentle fade)
        const rawSine = Math.sin(fly.phase);
        const pulse = Math.pow(Math.max(0, rawSine), 2.2);
        const currentAlpha = (0.12 + 0.88 * pulse) * fly.depthAlpha;

        if (currentAlpha <= 0.02) return;

        // 3. Render luminous firefly glow
        const glowRadius = Math.max(3, fly.baseRadius * 4.5);

        // Soft outer golden halo
        const radialGrad = ctx.createRadialGradient(
          fly.x,
          fly.y,
          0,
          fly.x,
          fly.y,
          glowRadius
        );
        radialGrad.addColorStop(0, fly.glowColor.replace(/[\d.]+\)$/, `${(currentAlpha * 0.9).toFixed(3)})`));
        radialGrad.addColorStop(0.4, fly.glowColor.replace(/[\d.]+\)$/, `${(currentAlpha * 0.35).toFixed(3)})`));
        radialGrad.addColorStop(1, 'rgba(255, 210, 60, 0)');

        ctx.beginPath();
        ctx.arc(fly.x, fly.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = radialGrad;
        ctx.fill();

        // Bright gold-white core dot
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = fly.color;
        ctx.globalAlpha = Math.min(1, currentAlpha * 1.1);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="firefly-canvas"
      aria-hidden="true"
      className="absolute inset-0 z-5 pointer-events-none"
    />
  );
};
