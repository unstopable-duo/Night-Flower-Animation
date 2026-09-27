/**
 * ============================================================================
 * Dedication & Legal Ownership Notice
 * ============================================================================
 * Specially created for: Neo Naledi Mogoboya
 * Made by: Roland Penn
 *
 * This work was made by Roland Penn for Neo Naledi Mogoboya.
 * Use without acknowledgements of the creator (Roland Penn) is illegal.
 * ============================================================================
 */

import React, { useEffect, useRef } from 'react';
import { HeartParticle, SparkleParticle, AmbientPetal, ShootingStar } from '../types';
import { sound } from '../utils/soundEngine';

interface HeartCanvasProps {
  interactiveSparkles?: boolean;
  spawnRateMultiplier?: number;
}

export const HeartCanvas: React.FC<HeartCanvasProps> = ({
  interactiveSparkles = true,
  spawnRateMultiplier = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const heartsRef = useRef<HeartParticle[]>([]);
  const sparklesRef = useRef<SparkleParticle[]>([]);
  const petalsRef = useRef<AmbientPetal[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const nextIdRef = useRef<number>(1);
  const frameCountRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  // Pure, emotional flat pink palette (flat and mostly pink, distinct from lilac-pink flower petals)
  const heartColors = [
    'rgba(255, 117, 159, 0.92)', // Sweet Rose Pink
    'rgba(255, 142, 177, 0.90)', // Tender Petal Blush
    'rgba(255, 166, 193, 0.88)', // Delicate Pastel Peony
    'rgba(251, 113, 133, 0.92)', // Gentle Coral Rose
    'rgba(244, 114, 182, 0.90)', // Rose Quartz
    'rgba(255, 110, 150, 0.92)', // Peach Blossom Pink
    'rgba(255, 128, 168, 0.88)', // Ballet Slipper Pink
  ];

  // Mathematically balanced, slender, deeply emotional 2D romantic heart silhouette
  const drawHeart = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
    opacity: number,
    rotation: number
  ) => {
    if (size <= 0.5 || opacity <= 0.01) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

    const s = size / 18; // scale factor
    const yOff = -3 * s; // optical vertical center offset

    ctx.beginPath();
    // Gentle cleft notch at top
    ctx.moveTo(0, -4.5 * s + yOff);
    // Graceful left shoulder and softly rounded lobe
    ctx.bezierCurveTo(-5.5 * s, -13.5 * s + yOff, -14 * s, -11 * s + yOff, -14 * s, -1 * s + yOff);
    // Slender, poetic lower taper down to the delicate tip
    ctx.bezierCurveTo(-14 * s, 7 * s + yOff, -4 * s, 15 * s + yOff, 0, 20 * s + yOff);
    // Slender lower sweep up from tip
    ctx.bezierCurveTo(4 * s, 15 * s + yOff, 14 * s, 7 * s + yOff, 14 * s, -1 * s + yOff);
    // Graceful right shoulder back to cleft notch
    ctx.bezierCurveTo(14 * s, -11 * s + yOff, 5.5 * s, -13.5 * s + yOff, 0, -4.5 * s + yOff);
    ctx.closePath();

    // Pure, flat, crisp 2D fill (flat and mostly pink, deeply emotional and clean)
    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
  };

  // Helper to draw a delicate starlight sparkle
  const drawSparkle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
    opacity: number,
    rotation: number,
    isStar: boolean
  ) => {
    if (size <= 0.2 || opacity <= 0.01) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

    if (isStar) {
      // Crisp 4-point diamond star
      ctx.fillStyle = color;
      ctx.beginPath();
      const rInner = Math.max(0.1, size * 0.22);
      const rOuter = Math.max(0.2, size);
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? rOuter : rInner;
        const angle = (i * Math.PI) / 4;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // White diamond core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0.05, size * 0.25), 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Soft stardust particle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0.4, size * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  // Helper to draw subtle drifting petals
  const drawPetal = (
    ctx: CanvasRenderingContext2D,
    p: AmbientPetal
  ) => {
    if (p.size <= 0.5 || p.opacity <= 0.01) return;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotationZ);
    ctx.scale(Math.cos(p.rotationX), Math.sin(p.rotationY));
    ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Spawns a floating 2D heart (dainty, delicate, romantic)
  const spawnHeart = (
    startX: number,
    startY: number,
    customSize?: number,
    customVy?: number
  ) => {
    const selectedColor = heartColors[Math.floor(Math.random() * heartColors.length)];
    // Balanced delicate size: between 8px and 15px (not bulky)
    const baseSize = customSize || (8 + Math.random() * 8);

    const heart: HeartParticle = {
      id: nextIdRef.current++,
      x: startX + (Math.random() - 0.5) * 32,
      y: startY,
      vx: (Math.random() - 0.5) * 0.35,
      vy: customVy || -(0.6 + Math.random() * 0.5),
      size: baseSize,
      scale: 0.1,
      baseScale: 1,
      opacity: 0,
      maxOpacity: 0.88 + Math.random() * 0.12,
      rotation: (Math.random() - 0.5) * 0.3,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      swayAmplitude: 10 + Math.random() * 12,
      swayFrequency: 0.015 + Math.random() * 0.01,
      swayOffset: Math.random() * Math.PI * 2,
      color: selectedColor,
      glowColor: selectedColor,
      life: 0,
      maxLife: 320 + Math.random() * 120,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.035 + Math.random() * 0.015,
    };

    heartsRef.current.push(heart);
  };

  // Spawns soft starlight sparkles behind hearts
  const spawnSparkle = (
    x: number,
    y: number,
    color: string = '#fff5a5',
    isBurst: boolean = false
  ) => {
    const sparkleColors = ['#ffffff', '#fff5a5', '#ffd700', '#ffe082', '#ff80bf'];
    const selectedColor = isBurst ? sparkleColors[Math.floor(Math.random() * sparkleColors.length)] : color;

    const sparkle: SparkleParticle = {
      id: nextIdRef.current++,
      x: x + (Math.random() - 0.5) * 3,
      y: y + (Math.random() - 0.5) * 3,
      vx: (Math.random() - 0.5) * (isBurst ? 2.2 : 0.35),
      vy: isBurst ? (Math.random() - 0.5) * 2.2 : (0.15 + Math.random() * 0.3),
      size: isBurst ? (2.5 + Math.random() * 4) : (1.6 + Math.random() * 2.8),
      color: selectedColor,
      opacity: 0.85 + Math.random() * 0.15,
      maxLife: isBurst ? (24 + Math.random() * 20) : (18 + Math.random() * 18),
      life: 0,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.08,
      isStar: Math.random() > 0.45,
    };

    sparklesRef.current.push(sparkle);
  };

  // Burst explosion of delicate hearts and sparkles at coordinates
  const triggerBurst = (x: number, y: number, count: number = 7) => {
    sound.playHeartBurst();
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.35;
      const speed = 1.8 + Math.random() * 3;
      const customVy = Math.sin(angle) * speed - 1.0;
      const customVx = Math.cos(angle) * speed;

      const selectedColor = heartColors[Math.floor(Math.random() * heartColors.length)];
      const heart: HeartParticle = {
        id: nextIdRef.current++,
        x,
        y,
        vx: customVx,
        vy: customVy,
        size: 7 + Math.random() * 7,
        scale: 0.2,
        baseScale: 1,
        opacity: 1,
        maxOpacity: 1,
        rotation: (Math.random() - 0.5) * 0.35,
        rotSpeed: (Math.random() - 0.5) * 0.025,
        swayAmplitude: 12,
        swayFrequency: 0.02,
        swayOffset: Math.random() * Math.PI * 2,
        color: selectedColor,
        glowColor: selectedColor,
        life: 0,
        maxLife: 150 + Math.random() * 60,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.06,
      };
      heartsRef.current.push(heart);
    }

    // Sparkling stardust
    for (let j = 0; j < 14; j++) {
      spawnSparkle(x, y, '#ffffff', true);
    }
  };

  // Initialize ambient petals (subtle drift)
  useEffect(() => {
    petalsRef.current = Array.from({ length: 12 }).map(() => ({
      id: nextIdRef.current++,
      x: Math.random() * (window.innerWidth || 800),
      y: Math.random() * (window.innerHeight || 600),
      vx: (Math.random() - 0.5) * 0.4 - 0.2,
      vy: 0.4 + Math.random() * 0.5,
      size: 4 + Math.random() * 5,
      rotationX: Math.random() * Math.PI,
      rotationY: Math.random() * Math.PI,
      rotationZ: Math.random() * Math.PI,
      rotSpeedX: 0.01 + Math.random() * 0.015,
      rotSpeedY: 0.01 + Math.random() * 0.015,
      rotSpeedZ: 0.01 + Math.random() * 0.015,
      opacity: 0.25 + Math.random() * 0.25,
      color: Math.random() > 0.4 ? '#ff9ec9' : '#ffc2d8',
    }));
  }, []);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      frameCountRef.current++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Performance: During initial blooming (~first 4 seconds), throttle heart spawning
      const isInitialBlooming = frameCountRef.current < 220;

      // 1. Periodically spawn organic rising 2D hearts (gentle ambient rate)
      const spawnInterval = isInitialBlooming ? 55 : Math.max(16, Math.round(28 / spawnRateMultiplier));
      if (frameCountRef.current % spawnInterval === 0 && heartsRef.current.length < 32) {
        const flowerZoneX = canvas.width * 0.5 + (Math.random() - 0.5) * (canvas.width * 0.5);
        const flowerZoneY = canvas.height * 0.76 + (Math.random() - 0.5) * (canvas.height * 0.1);
        spawnHeart(flowerZoneX, flowerZoneY);
      }

      // 2. Interactive Sparkle Wand when mouse moves
      if (interactiveSparkles && mousePosRef.current.active && frameCountRef.current % 4 === 0) {
        spawnSparkle(mousePosRef.current.x, mousePosRef.current.y, '#ffd1e8', false);
        if (frameCountRef.current % 12 === 0) {
          spawnHeart(mousePosRef.current.x, mousePosRef.current.y, 7 + Math.random() * 6, -1.5);
        }
      }

      // 3. Occasionally spawn soft shooting star
      if (Math.random() < 0.005 && shootingStarsRef.current.length < 2) {
        shootingStarsRef.current.push({
          id: nextIdRef.current++,
          x: Math.random() * canvas.width * 0.8,
          y: Math.random() * canvas.height * 0.35,
          length: 50 + Math.random() * 60,
          speed: 7 + Math.random() * 5,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          opacity: 0.75,
          life: 0,
          maxLife: 26 + Math.random() * 16,
        });
      }

      // 4. Update and draw shooting stars
      shootingStarsRef.current = shootingStarsRef.current.filter((star) => {
        star.life++;
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        const progress = star.life / star.maxLife;
        const currentOpacity = star.opacity * (1 - progress);

        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = currentOpacity;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(
          star.x - Math.cos(star.angle) * star.length * (1 - progress * 0.5),
          star.y - Math.sin(star.angle) * star.length * (1 - progress * 0.5)
        );
        ctx.stroke();
        ctx.restore();

        return star.life < star.maxLife;
      });

      // 5. Update and draw trailing sparkles
      sparklesRef.current = sparklesRef.current.filter((sp) => {
        sp.life++;
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.rotation += sp.rotSpeed;

        const progress = sp.life / sp.maxLife;
        const currentOpacity = sp.opacity * (1 - progress);

        drawSparkle(ctx, sp.x, sp.y, sp.size, sp.color, currentOpacity, sp.rotation, sp.isStar);

        return sp.life < sp.maxLife;
      });

      // 6. Update and draw delicate 2D hearts WITH SPARKLE TRAILS
      heartsRef.current = heartsRef.current.filter((heart) => {
        heart.life++;
        heart.swayOffset += heart.swayFrequency;
        heart.pulsePhase += heart.pulseSpeed;

        // Upward drift + graceful sinusoidal horizontal sway
        const swayForce = Math.sin(heart.swayOffset) * 0.65;
        heart.x += heart.vx + swayForce;
        heart.y += heart.vy;
        heart.rotation += heart.rotSpeed;

        // Natural heartbeat scale oscillation
        const pulse = 1 + Math.sin(heart.pulsePhase) * 0.05;

        // Smooth birth and death lifecycle
        const birthFrames = 26;
        const deathFrames = 36;
        let alpha = heart.maxOpacity;
        if (heart.life < birthFrames) {
          const t = Math.max(0, Math.min(1, heart.life / birthFrames));
          heart.scale = Math.max(0.01, t * heart.baseScale);
          alpha = t * heart.maxOpacity;
        } else if (heart.life > heart.maxLife - deathFrames) {
          const t = Math.max(0, Math.min(1, (heart.maxLife - heart.life) / deathFrames));
          heart.scale = Math.max(0.01, t * heart.baseScale);
          alpha = t * heart.maxOpacity;
        } else {
          heart.scale = Math.max(0.01, heart.baseScale * pulse);
          alpha = heart.maxOpacity;
        }

        // *** DELICATE GOLD SPARKLE TRAIL ***
        // While heart is ascending, emit a soft stardust sparkle behind its base
        if (frameCountRef.current % 5 === 0 && alpha > 0.25) {
          const tipOffset = heart.size * heart.scale * 0.6;
          const tipX = heart.x - Math.sin(heart.rotation) * tipOffset;
          const tipY = heart.y + Math.cos(heart.rotation) * tipOffset;

          spawnSparkle(tipX, tipY, '#fff5a5', false);
        }

        // Draw elegant 2D heart
        const computedSize = heart.size * heart.scale;
        if (computedSize > 0.5 && alpha > 0.01) {
          drawHeart(
            ctx,
            heart.x,
            heart.y,
            computedSize,
            heart.color,
            alpha,
            heart.rotation
          );
        }

        // Gentle stardust puff upon natural dissipation
        if (heart.life >= heart.maxLife && heart.y < canvas.height * 0.4) {
          for (let k = 0; k < 3; k++) {
            spawnSparkle(heart.x, heart.y, heart.color, true);
          }
        }

        return heart.life < heart.maxLife && heart.y > -50;
      });

      // 7. Ambient drifting petals
      petalsRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotationX += p.rotSpeedX;
        p.rotationY += p.rotSpeedY;
        p.rotationZ += p.rotSpeedZ;

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;

        drawPetal(ctx, p);
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [interactiveSparkles, spawnRateMultiplier]);

  // Touch and click handlers for interactive heart bursts
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    triggerBurst(x, y, 7);
    mousePosRef.current = { x, y, active: true };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };

  const handlePointerUp = () => {
    mousePosRef.current.active = false;
  };

  return (
    <canvas
      ref={canvasRef}
      id="heart-sparkle-canvas"
      className="absolute inset-0 z-30 pointer-events-auto cursor-pointer"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
};
