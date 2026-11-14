import React, { useEffect, useRef } from 'react';
import { WeatherMode } from '../types';

export type { WeatherMode };

interface DynamicWeatherSkyProps {
  weatherMode: WeatherMode;
  width: number;
  height: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: string;
}

interface Lantern {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  flicker: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
}

interface DistantBurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
}

interface DistantBurst {
  particles: DistantBurstParticle[];
}

function createLanternGlowSprite(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const sprite = document.createElement('canvas');
  sprite.width = 64;
  sprite.height = 64;
  const sCtx = sprite.getContext('2d');
  if (!sCtx) return null;
  const grad = sCtx.createRadialGradient(32, 32, 2, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 237, 213, 0.95)');
  grad.addColorStop(0.4, 'rgba(249, 115, 22, 0.65)');
  grad.addColorStop(1, 'rgba(249, 115, 22, 0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 64, 64);
  return sprite;
}

export const DynamicWeatherSky: React.FC<DynamicWeatherSkyProps> = React.memo(
  ({ weatherMode, width, height }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const lanternGlowSpriteRef = useRef<HTMLCanvasElement | null>(null);

    const starsRef = useRef<Star[]>([]);
    const lanternsRef = useRef<Lantern[]>([]);
    const shootingStarRef = useRef<ShootingStar>({
      x: 0,
      y: 0,
      length: 80,
      speed: 12,
      angle: Math.PI / 5,
      alpha: 0,
      active: false
    });
    const distantBurstsRef = useRef<DistantBurst[]>([]);

    useEffect(() => {
      if (!lanternGlowSpriteRef.current) {
        lanternGlowSpriteRef.current = createLanternGlowSprite();
      }
    }, []);

    useEffect(() => {
      const starColors = ['#FFFFFF', '#FEF08A', '#BAE6FD', '#FDE047', '#E0F2FE'];
      const isCompact = width < 640;
      const starsCount = isCompact ? 64 : 120;
      starsRef.current = Array.from({ length: starsCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * (height * 0.46),
        size: Math.random() * 1.8 + 0.6,
        baseAlpha: Math.random() * 0.6 + 0.25,
        twinkleSpeed: Math.random() * 2 + 1.2,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)]
      }));

      const lanternCount =
        weatherMode === 'lanterns' ? (isCompact ? 12 : 22) : isCompact ? 4 : 7;
      lanternsRef.current = Array.from({ length: lanternCount }, () => ({
        x: Math.random() * width,
        y: height * 0.14 + Math.random() * (height * 0.34),
        vx: (Math.random() - 0.2) * 0.3,
        vy: -0.2 - Math.random() * 0.3,
        size: Math.random() * 5.5 + 4,
        alpha: Math.random() * 0.6 + 0.4,
        flicker: Math.random() * 10
      }));
    }, [width, height, weatherMode]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      const isCompact = width < 640;
      // Throttle subtle ambient sky to ~30fps on mobile to reserve GPU/CPU headroom for 60fps fireworks bursts
      const minFrameIntervalMs = isCompact ? 32 : 16;

      let nextShootingStarTime = performance.now() + 6000 + Math.random() * 8000;
      let nextDistantBurstTime = performance.now() + 2000;
      let lastDrawTime = performance.now();

      const mistGrad =
        weatherMode === 'mist'
          ? (() => {
              const g = ctx.createLinearGradient(0, height * 0.1, 0, height * 0.48);
              g.addColorStop(0, 'rgba(254, 240, 138, 0.02)');
              g.addColorStop(0.6, 'rgba(180, 83, 9, 0.06)');
              g.addColorStop(1, 'rgba(0, 0, 0, 0)');
              return g;
            })()
          : null;

      const render = (now: number) => {
        if (document.hidden) {
          lastDrawTime = now;
          animFrameRef.current = requestAnimationFrame(render);
          return;
        }

        const elapsedMs = now - lastDrawTime;
        if (elapsedMs < minFrameIntervalMs - 2) {
          animFrameRef.current = requestAnimationFrame(render);
          return;
        }

        const dt = Math.min(3.0, Math.max(0.5, elapsedMs / 16.667));
        lastDrawTime = now;

        ctx.clearRect(0, 0, width, height);

        // --- 1. Twinkling Stars in Night Sky ---
        const stars = starsRef.current;
        const mistFactor = weatherMode === 'mist' ? 0.6 : 1;
        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];
          const twinkle = Math.sin(now * 0.002 * star.twinkleSpeed + star.twinkleOffset);
          const currentAlpha = Math.max(0.1, Math.min(1.0, star.baseAlpha + twinkle * 0.35));

          ctx.fillStyle = star.color;
          ctx.globalAlpha = currentAlpha * mistFactor;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();

          if (!isCompact && star.size > 2.0 && twinkle > 0.6) {
            ctx.strokeStyle = star.color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(star.x - star.size * 2, star.y);
            ctx.lineTo(star.x + star.size * 2, star.y);
            ctx.moveTo(star.x, star.y - star.size * 2);
            ctx.lineTo(star.x, star.y + star.size * 2);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;

        // --- 2. Occasional Shooting Star ---
        if (!shootingStarRef.current.active && now > nextShootingStarTime) {
          shootingStarRef.current = {
            x: Math.random() * width * 0.7,
            y: Math.random() * (height * 0.2),
            length: 70 + Math.random() * 50,
            speed: 18 + Math.random() * 8,
            angle: Math.PI / 6 + (Math.random() - 0.5) * 0.2,
            alpha: 1.0,
            active: true
          };
          nextShootingStarTime = now + 12000 + Math.random() * 14000;
        }

        if (shootingStarRef.current.active) {
          const ss = shootingStarRef.current;
          ss.x += Math.cos(ss.angle) * ss.speed * dt;
          ss.y += Math.sin(ss.angle) * ss.speed * dt;
          ss.alpha -= 0.025 * dt;

          if (ss.alpha <= 0 || ss.x > width || ss.y > height * 0.45) {
            ss.active = false;
          } else {
            ctx.strokeStyle = '#FEF08A';
            ctx.globalAlpha = Math.max(0, ss.alpha);
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(ss.x - Math.cos(ss.angle) * ss.length, ss.y - Math.sin(ss.angle) * ss.length);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }

        // --- 3. Floating Sky Lanterns (cached glow sprite -> 0 createRadialGradient allocations) ---
        const glowSprite = lanternGlowSpriteRef.current;
        const lanterns = lanternsRef.current;
        for (let i = 0; i < lanterns.length; i++) {
          const l = lanterns[i];
          l.x += l.vx * dt;
          l.y += l.vy * dt;
          l.flicker += 0.05 * dt;

          if (l.y < -30) {
            l.y = height * 0.42;
            l.x = Math.random() * width;
          }

          const flickerAlpha = l.alpha * (0.85 + Math.sin(l.flicker) * 0.15);

          if (glowSprite) {
            const radius = l.size * 2.5;
            ctx.globalAlpha = flickerAlpha * 0.85;
            ctx.drawImage(glowSprite, l.x - radius, l.y - radius, radius * 2, radius * 2);
          }

          ctx.fillStyle = '#FED7AA';
          ctx.globalAlpha = flickerAlpha;
          ctx.fillRect(l.x - l.size * 0.6, l.y - l.size * 0.8, l.size * 1.2, l.size * 1.6);
        }
        ctx.globalAlpha = 1;

        // --- 4. Distant Horizon Fireworks ---
        if (weatherMode === 'distant_fireworks' && now > nextDistantBurstTime) {
          nextDistantBurstTime = now + 1400 + Math.random() * 1800;
          const burstColors = ['#F59E0B', '#EF4444', '#10B981', '#38BDF8', '#EC4899', '#A855F7'];
          const chosenColor = burstColors[Math.floor(Math.random() * burstColors.length)];
          const burstX = width * 0.08 + Math.random() * (width * 0.84);
          const burstY = height * 0.22 + Math.random() * (height * 0.16);
          const burstCount = isCompact ? 16 : 24;

          const newParticles = Array.from({ length: burstCount }, () => {
            const ang = Math.random() * Math.PI * 2;
            const spd = Math.random() * 2.2 + 0.8;
            return {
              x: burstX,
              y: burstY,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd,
              color: chosenColor,
              alpha: 1.0
            };
          });

          distantBurstsRef.current.push({ particles: newParticles });
        }

        if (distantBurstsRef.current.length > 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          for (let b = distantBurstsRef.current.length - 1; b >= 0; b--) {
            const burst = distantBurstsRef.current[b];
            let hasAlive = false;

            for (let pi = 0; pi < burst.particles.length; pi++) {
              const p = burst.particles[pi];
              p.x += p.vx * dt;
              p.y += p.vy * dt;
              p.vy += 0.04 * dt;
              p.alpha -= 0.02 * dt;

              if (p.alpha > 0.02) {
                hasAlive = true;
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha * 0.7;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
                ctx.fill();
              }
            }

            if (!hasAlive) {
              const lastIdx = distantBurstsRef.current.length - 1;
              if (b !== lastIdx) distantBurstsRef.current[b] = distantBurstsRef.current[lastIdx];
              distantBurstsRef.current.pop();
            }
          }
          ctx.restore();
        }

        // --- 5. Warm Festive Evening Haze ---
        if (mistGrad) {
          ctx.fillStyle = mistGrad;
          ctx.fillRect(0, 0, width, height * 0.48);
        }

        animFrameRef.current = requestAnimationFrame(render);
      };

      animFrameRef.current = requestAnimationFrame(render);

      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }, [height, weatherMode, width]);

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-none z-10"
      />
    );
  }
);
