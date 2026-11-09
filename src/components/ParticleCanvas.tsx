import React, { useEffect, useRef } from 'react';
import { ActiveCracker } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  gravity: number;
  trail?: { x: number; y: number }[];
  isSmoke?: boolean;
}

interface RocketProjectile {
  id: string;
  x: number;
  y: number;
  targetY: number;
  vx: number;
  vy: number;
  colorScheme: string[];
  hasExploded: boolean;
  isLetterBurst?: boolean;
}

interface LetterParticle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  alpha: number;
  spawnTime: number;
  durationMs: number;
  size: number;
}

interface ParticleCanvasProps {
  activeCrackers: ActiveCracker[];
  onCrackerFinish: (id: string) => void;
  width: number;
  height: number;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  activeCrackers,
  onCrackerFinish,
  width,
  height
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rocketsRef = useRef<RocketProjectile[]>([]);
  const letterParticlesRef = useRef<LetterParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const prevCrackersRef = useRef<Map<string, ActiveCracker>>(new Map());

  useEffect(() => {
    activeCrackers.forEach((cracker) => {
      if (!prevCrackersRef.current.has(cracker.id)) {
        if (cracker.type === 'rocket' || cracker.type === 'sky_letters') {
          setTimeout(() => {
            rocketsRef.current.push({
              id: cracker.id,
              x: cracker.x,
              y: cracker.y - 20,
              targetY: cracker.type === 'sky_letters' ? Math.max(90, height * 0.22) : Math.max(70, cracker.y - (320 + Math.random() * 160)),
              vx: cracker.type === 'sky_letters' ? 0 : (Math.random() - 0.5) * 1.2,
              vy: cracker.type === 'sky_letters' ? -15 : -13 - Math.random() * 3,
              colorScheme: cracker.colorScheme,
              hasExploded: false,
              isLetterBurst: cracker.type === 'sky_letters'
            });
          }, cracker.fuseEndTime - cracker.startTime);
        }
      }
    });

    const newMap = new Map<string, ActiveCracker>();
    activeCrackers.forEach((c) => newMap.set(c.id, c));
    prevCrackersRef.current = newMap;
  }, [activeCrackers, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const spawnSparks = (
      x: number,
      y: number,
      count: number,
      colors: string[],
      speed: number,
      spreadAngle: number,
      baseAngle = -Math.PI / 2,
      gravity = 0.15
    ) => {
      for (let i = 0; i < count; i++) {
        const angle = baseAngle + (Math.random() - 0.5) * spreadAngle;
        const v = speed * (0.4 + Math.random() * 0.8);
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: 0.015 + Math.random() * 0.025,
          size: Math.random() * 2.8 + 1.2,
          gravity,
          trail: []
        });
      }
    };

    const spawnSmoke = (x: number, y: number, count = 1) => {
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -0.6 - Math.random() * 0.8,
          color: 'rgba(212, 212, 216, 0.45)',
          alpha: 0.45,
          decay: 0.008,
          size: Math.random() * 8 + 4,
          gravity: -0.01,
          isSmoke: true
        });
      }
    };

    const spawnExplosion = (x: number, y: number, colors: string[], starCount = 95) => {
      for (let i = 0; i < starCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3.5;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: 0.012 + Math.random() * 0.018,
          size: Math.random() * 3.5 + 1.5,
          gravity: 0.16,
          trail: []
        });
      }
      spawnSmoke(x, y, 8);
    };

    // Form "HAPPY DIWALI TO ALL" in the sky
    const spawnSkyLetters = (burstX: number, burstY: number) => {
      const off = document.createElement('canvas');
      off.width = 460;
      off.height = 90;
      const offCtx = off.getContext('2d');
      if (!offCtx) return;

      offCtx.textAlign = 'center';
      offCtx.fillStyle = '#ffffff';
      offCtx.font = '900 32px sans-serif';
      offCtx.fillText('HAPPY DIWALI', 230, 36);
      offCtx.font = '800 24px sans-serif';
      offCtx.fillText('TO ALL', 230, 72);

      const imgData = offCtx.getImageData(0, 0, 460, 90);
      const data = imgData.data;
      const step = 4;
      const now = performance.now();

      for (let y = 0; y < 90; y += step) {
        for (let x = 0; x < 460; x += step) {
          const idx = (y * 460 + x) * 4 + 3;
          if (data[idx] > 120) {
            const destX = burstX + (x - 230);
            const destY = burstY + (y - 45);

            // Start with a slight radial burst from center
            const ang = Math.random() * Math.PI * 2;
            const dist = Math.random() * 25;

            letterParticlesRef.current.push({
              x: burstX + Math.cos(ang) * dist,
              y: burstY + Math.sin(ang) * dist,
              targetX: destX,
              targetY: destY,
              color: Math.random() > 0.35 ? '#FDE047' : '#F59E0B',
              alpha: 1.0,
              spawnTime: now,
              durationMs: 6500,
              size: Math.random() * 2.2 + 1.8
            });
          }
        }
      }
    };

    const render = (now: number) => {
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // --- 1. Draw Physical Cracker Objects on Terrace Ground ---
      activeCrackers.forEach((cracker) => {
        const isFusing = now < cracker.fuseEndTime;

        ctx.save();

        if (cracker.type === 'anar') {
          ctx.fillStyle = '#9A3412';
          ctx.beginPath();
          ctx.moveTo(cracker.x - 14, cracker.y);
          ctx.lineTo(cracker.x + 14, cracker.y);
          ctx.lineTo(cracker.x + 4, cracker.y - 24);
          ctx.lineTo(cracker.x - 4, cracker.y - 24);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 2;
          ctx.stroke();

          if (isFusing) {
            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.arc(cracker.x, cracker.y - 25, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (cracker.type === 'charkhi') {
          ctx.fillStyle = '#1E293B';
          ctx.beginPath();
          ctx.ellipse(cracker.x, cracker.y, 16, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (cracker.type === 'rocket' || cracker.type === 'sky_letters') {
          // Glass soda bottle on floor
          ctx.fillStyle = cracker.type === 'sky_letters' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(16, 185, 129, 0.4)';
          ctx.fillRect(cracker.x - 5, cracker.y - 22, 10, 22);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fillRect(cracker.x - 3, cracker.y - 28, 6, 6);

          if (isFusing) {
            ctx.strokeStyle = '#D97706';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cracker.x, cracker.y - 10);
            ctx.lineTo(cracker.x, cracker.y - 42);
            ctx.stroke();

            ctx.fillStyle = cracker.type === 'sky_letters' ? '#F59E0B' : '#EF4444';
            ctx.beginPath();
            ctx.moveTo(cracker.x - 5, cracker.y - 42);
            ctx.lineTo(cracker.x + 5, cracker.y - 42);
            ctx.lineTo(cracker.x, cracker.y - 56);
            ctx.closePath();
            ctx.fill();
          }
        } else if (cracker.type === 'skyshot') {
          ctx.fillStyle = '#7C3AED';
          ctx.fillRect(cracker.x - 14, cracker.y - 18, 28, 18);
          ctx.strokeStyle = '#FDE047';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(cracker.x - 14, cracker.y - 18, 28, 18);
        }

        ctx.restore();
      });

      // --- 2. Process Active Crackers Continuous Emissions ---
      activeCrackers.forEach((cracker) => {
        const elapsedMs = now - cracker.startTime;
        const totalDurationMs = cracker.endTime - cracker.startTime;

        if (now < cracker.fuseEndTime) {
          spawnSparks(cracker.x, cracker.y - 16, 2, ['#FDE047', '#F97316', '#FFFFFF'], 1.6, Math.PI * 2, 0, 0.06);
          if (Math.random() < 0.4) {
            spawnSmoke(cracker.x, cracker.y - 16, 1);
          }
          return;
        }

        if (now > cracker.endTime) {
          onCrackerFinish(cracker.id);
          return;
        }

        const activeFraction = Math.max(0, Math.min(1, elapsedMs / totalDurationMs));

        if (cracker.type === 'charkhi') {
          const rotSpeed = now * 0.038;
          const numJets = 4;
          for (let j = 0; j < numJets; j++) {
            const jetAngle = rotSpeed + (j * (Math.PI * 2)) / numJets;
            const jetX = cracker.x + Math.cos(jetAngle) * 18;
            const jetY = cracker.y + Math.sin(jetAngle) * 7;
            spawnSparks(jetX, jetY, 4, cracker.colorScheme, 6.8, 0.35, jetAngle + Math.PI / 2, 0.09);
          }

          if (Math.random() < 0.3) {
            spawnSmoke(cracker.x, cracker.y, 1);
          }

          const glow = ctx.createRadialGradient(cracker.x, cracker.y, 4, cracker.x, cracker.y, 130);
          glow.addColorStop(0, 'rgba(253, 224, 71, 0.32)');
          glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(cracker.x, cracker.y, 130, 0, Math.PI * 2);
          ctx.fill();
        } else if (cracker.type === 'anar') {
          const power = Math.min(1.0, activeFraction * 1.8);
          const fountainHeight = 140 + power * 240;
          const sparkSpeed = Math.sqrt(fountainHeight * 0.38);

          spawnSparks(cracker.x, cracker.y - 18, Math.floor(10 + power * 14), cracker.colorScheme, sparkSpeed, 0.65, -Math.PI / 2, 0.24);

          if (Math.random() < 0.3) {
            spawnSmoke(cracker.x, cracker.y - fountainHeight * 0.5, 1);
          }

          ctx.beginPath();
          ctx.moveTo(cracker.x - 7, cracker.y - 18);
          ctx.lineTo(cracker.x + 7, cracker.y - 18);
          ctx.lineTo(cracker.x, cracker.y - 35 - power * 45);
          ctx.closePath();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.fill();

          const glow = ctx.createRadialGradient(cracker.x, cracker.y - 60, 10, cracker.x, cracker.y - 60, 240);
          glow.addColorStop(0, 'rgba(253, 224, 71, 0.42)');
          glow.addColorStop(1, 'rgba(236, 72, 153, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(cracker.x, cracker.y - 60, 240, 0, Math.PI * 2);
          ctx.fill();
        } else if (cracker.type === 'phooljhadi') {
          spawnSparks(cracker.x, cracker.y, 6, cracker.colorScheme, 3.8, Math.PI * 2, 0, 0.05);
        } else if (cracker.type === 'skyshot') {
          const shotInterval = 680;
          const currentShot = Math.floor(elapsedMs / shotInterval);
          const shotMod = elapsedMs % shotInterval;

          if (shotMod < 50 && currentShot <= 6) {
            spawnSparks(cracker.x, cracker.y - 18, 12, ['#F59E0B', '#EF4444'], 5.2, 0.4, -Math.PI / 2, 0.1);
            spawnSmoke(cracker.x, cracker.y - 20, 2);

            setTimeout(() => {
              const skyX = cracker.x + (Math.random() - 0.5) * 180;
              const skyY = Math.max(80, cracker.y - (310 + Math.random() * 140));
              spawnExplosion(skyX, skyY, cracker.colorScheme, 110);
            }, 600);
          }
        }
      });

      // --- 3. Update and Render Rockets ---
      for (let r = rocketsRef.current.length - 1; r >= 0; r--) {
        const rocket = rocketsRef.current[r];
        if (!rocket.hasExploded) {
          rocket.x += rocket.vx;
          rocket.y += rocket.vy;
          rocket.vy += 0.07;

          spawnSparks(rocket.x, rocket.y + 6, 3, ['#F97316', '#FBBF24', '#71717A'], 2.2, 0.4, Math.PI / 2, 0.02);
          spawnSmoke(rocket.x, rocket.y + 8, 1);

          ctx.save();
          ctx.fillStyle = rocket.isLetterBurst ? '#F59E0B' : '#EF4444';
          ctx.beginPath();
          ctx.arc(rocket.x, rocket.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#D97706';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(rocket.x, rocket.y);
          ctx.lineTo(rocket.x, rocket.y + 16);
          ctx.stroke();
          ctx.restore();

          if (rocket.y <= rocket.targetY || rocket.vy >= -1) {
            rocket.hasExploded = true;
            spawnExplosion(rocket.x, rocket.y, rocket.colorScheme, 120);

            if (rocket.isLetterBurst) {
              spawnSkyLetters(rocket.x, rocket.y);
            }

            rocketsRef.current.splice(r, 1);
          }
        }
      }

      // --- 4. Render Sky Letter Particles ("HAPPY DIWALI TO ALL") ---
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (let lp = letterParticlesRef.current.length - 1; lp >= 0; lp--) {
        const p = letterParticlesRef.current[lp];
        const age = now - p.spawnTime;

        if (age > p.durationMs) {
          letterParticlesRef.current.splice(lp, 1);
          continue;
        }

        // Smooth spring lerp to target letter coordinate
        p.x += (p.targetX - p.x) * 0.12;
        p.y += (p.targetY - p.y) * 0.12;

        // In final 1.5 seconds, gently drift downward
        if (age > p.durationMs - 1500) {
          p.targetY += 0.6;
          p.alpha = Math.max(0, (p.durationMs - age) / 1500);
        } else {
          // Shimmering starlight scintillation
          p.alpha = 0.85 + Math.sin(now * 0.012 + lp) * 0.15;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 5. Update and Draw Standard Sparks ---
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.985;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y > height + 20) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeCrackers, height, width, onCrackerFinish]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-30"
    />
  );
};
