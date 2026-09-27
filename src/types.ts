/**
 * Type Definitions
 * Dedicated to: Neo Naledi Mogoboya
 * Made by: Roland Penn
 * Notice: Any use without acknowledgements of the creator is illegal.
 */

export interface HeartParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  scale: number;
  baseScale: number;
  opacity: number;
  maxOpacity: number;
  rotation: number;
  rotSpeed: number;
  swayAmplitude: number;
  swayFrequency: number;
  swayOffset: number;
  color: string;
  glowColor: string;
  life: number;
  maxLife: number;
  pulsePhase: number;
  pulseSpeed: number;
}

export interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  maxLife: number;
  life: number;
  rotation: number;
  rotSpeed: number;
  isStar: boolean;
}

export interface AmbientPetal {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  opacity: number;
  color: string;
}

export interface ShootingStar {
  id: number;
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
  maxLife: number;
}
