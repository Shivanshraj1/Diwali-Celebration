import React, { useEffect, useRef } from 'react';
import { ActiveCracker } from '../types';
import { soundEngine } from '../audio/soundEngine';

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
  isSmoke?: boolean;
}

interface RocketProjectile {
  id: string;
  x: number;
  y: number;
  targetY: number;
  vx: number;
  vy: number;
  gravity: number;
  colorScheme: string[];
  hasExploded: boolean;
  isLetterBurst?: boolean;
  isSkyshotShell?: boolean;
  stopSound?: () => void;
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

function createRadialGlowSprite(innerColor: string, outerColor: string): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const sprite = document.createElement('canvas');
  sprite.width = 128;
  sprite.height = 128;
  const sCtx = sprite.getContext('2d');
  if (!sCtx) return null;
  const grad = sCtx.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, innerColor);
  grad.addColorStop(1, outerColor);
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 128, 128);
  return sprite;
}

function swapRemove<T>(arr: T[], index: number): void {
  const lastIdx = arr.length - 1;
  if (index !== lastIdx) {
    arr[index] = arr[lastIdx];
  }
  arr.pop();
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
  const startLoopRef = useRef<(() => void) | null>(null);
  const isLoopRunningRef = useRef(false);

  const amberGlowSpriteRef = useRef<HTMLCanvasElement | null>(null);
  const roseGlowSpriteRef = useRef<HTMLCanvasElement | null>(null);

  const activeCrackersRef = useRef<ActiveCracker[]>(activeCrackers);
  useEffect(() => {
    activeCrackersRef.current = activeCrackers;
    if (activeCrackers.length > 0) {
      startLoopRef.current?.();
    }
  }, [activeCrackers]);

  const dimsRef = useRef({ width, height });
  useEffect(() => {
    dimsRef.current = { width, height };
  }, [width, height]);

  const onCrackerFinishRef = useRef(onCrackerFinish);
  useEffect(() => {
    onCrackerFinishRef.current = onCrackerFinish;
  }, [onCrackerFinish]);

  useEffect(() => {
    if (!amberGlowSpriteRef.current) {
      amberGlowSpriteRef.current = createRadialGlowSprite(
        'rgba(253, 224, 71, 0.34)',
        'rgba(245, 158, 11, 0)'
      );
    }
    if (!roseGlowSpriteRef.current) {
      roseGlowSpriteRef.current = createRadialGlowSprite(
        'rgba(253, 224, 71, 0.44)',
        'rgba(236, 72, 153, 0)'
      );
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const isLowEndHardware =
      typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 4) <= 4;

    const startedFuse = new Set<string>();
    const startedBurn = new Set<string>();
    const firedSkyshotCounts = new Map<string, number>();

    const getBudgets = (w: number) => {
      const isCompact = w < 640;
      const maxParticles = isCompact ? (isLowEndHardware ? 300 : 420) : 880;
      return { isCompact, maxParticles };
    };

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
      const { isCompact, maxParticles } = getBudgets(dimsRef.current.width);
      if (particlesRef.current.length >= maxParticles) return;

      const scaleFactor = isCompact ? (isLowEndHardware ? 0.52 : 0.65) : 1;
      const adjustedCount = Math.min(
        maxParticles - particlesRef.current.length,
        Math.max(1, Math.ceil(count * scaleFactor))
      );
      const speedScale = isCompact ? 0.82 : 1;

      for (let i = 0; i < adjustedCount; i++) {
        const angle = baseAngle + (Math.random() - 0.5) * spreadAngle;
        const v = speed * speedScale * (0.4 + Math.random() * 0.8);
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: 0.016 + Math.random() * 0.024,
          size: Math.random() * (isCompact ? 2.3 : 2.8) + 1.1,
          gravity
        });
      }
    };

    const spawnSmoke = (x: number, y: number, count = 1) => {
      const { maxParticles } = getBudgets(dimsRef.current.width);
      if (particlesRef.current.length >= maxParticles) return;
      const limit = Math.min(count, maxParticles - particlesRef.current.length);
      for (let i = 0; i < limit; i++) {
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 0.7,
          vy: -0.6 - Math.random() * 0.7,
          color: 'rgba(212, 212, 216, 0.4)',
          alpha: 0.4,
          decay: 0.01,
          size: Math.random() * 6 + 4,
          gravity: -0.01,
          isSmoke: true
        });
      }
    };

    const spawnExplosion = (x: number, y: number, colors: string[], starCount = 90) => {
      const { isCompact, maxParticles } = getBudgets(dimsRef.current.width);
      const desired = isCompact ? Math.floor(starCount * (isLowEndHardware ? 0.48 : 0.6)) : starCount;
      const headroom = Math.max(0, maxParticles - particlesRef.current.length);
      const count = Math.min(desired, headroom);
      const maxSpeed = isCompact ? 5.6 : 8;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * maxSpeed + 2.8;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: 0.013 + Math.random() * 0.018,
          size: Math.random() * (isCompact ? 2.6 : 3.4) + 1.3,
          gravity: 0.15
        });
      }
      if (!isLowEndHardware) {
        spawnSmoke(x, y, isCompact ? 2 : 6);
      }
    };

    // Scale "HAPPY DIWALI TO ALL" sky calligraphy safely inside viewport bounds
    const spawnSkyLetters = (burstX: number, burstY: number) => {
      const { width: w, height: h } = dimsRef.current;
      const isCompact = w < 640;
      const targetWidth = Math.min(440, Math.max(240, w * 0.86));
      const scale = targetWidth / 460;
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
      const step = isCompact ? (isLowEndHardware ? 6 : 5) : 4;
      const now = performance.now();

      const safeCenterX = Math.max(targetWidth * 0.52, Math.min(w - targetWidth * 0.52, burstX));
      const safeCenterY = Math.max(85, Math.min(h * 0.42, burstY));

      for (let y = 0; y < 90; y += step) {
        for (let x = 0; x < 460; x += step) {
          const idx = (y * 460 + x) * 4 + 3;
          if (data[idx] > 120) {
            const destX = safeCenterX + (x - 230) * scale;
            const destY = safeCenterY + (y - 45) * scale;

            const ang = Math.random() * Math.PI * 2;
            const dist = Math.random() * 22;

            letterParticlesRef.current.push({
              x: safeCenterX + Math.cos(ang) * dist,
              y: safeCenterY + Math.sin(ang) * dist,
              targetX: destX,
              targetY: destY,
              color: Math.random() > 0.35 ? '#FDE047' : '#F59E0B',
              alpha: 1.0,
              spawnTime: now,
              durationMs: 6500,
              size: (Math.random() * 1.9 + 1.5) * Math.max(0.75, scale)
            });
          }
        }
      }
    };

    const launchSingleRocket = (
      id: string,
      originX: number,
      originY: number,
      targetSkyY: number,
      vx: number,
      targetFrames: number,
      colorScheme: string[],
      options: { isLetterBurst?: boolean; isSkyshotShell?: boolean }
    ) => {
      const w = dimsRef.current.width;
      const startX = Math.max(24, Math.min(w - 24, originX));
      const startY = originY - 20;
      const travelDist = Math.max(100, startY - targetSkyY);
      const gravityPerFrame = 0.06;
      const initialVy = -(travelDist / targetFrames + 0.5 * gravityPerFrame * targetFrames);
      const flightSec = targetFrames / 60;

      let stopSound: (() => void) | undefined;
      if (options.isSkyshotShell) {
        soundEngine.playSkyshotLaunch();
      } else {
        stopSound = soundEngine.startRocketLaunchSound(flightSec);
      }

      rocketsRef.current.push({
        id,
        x: startX,
        y: startY,
        targetY: targetSkyY,
        vx,
        vy: initialVy,
        gravity: gravityPerFrame,
        colorScheme,
        hasExploded: false,
        isLetterBurst: options.isLetterBurst,
        isSkyshotShell: options.isSkyshotShell,
        stopSound
      });
    };

    let lastFrameTime = performance.now();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        lastFrameTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = (now: number) => {
      const currentCrackers = activeCrackersRef.current;

      // Sleep the rAF loop completely when idle so zero GPU/CPU overhead occurs
      if (
        currentCrackers.length === 0 &&
        particlesRef.current.length === 0 &&
        rocketsRef.current.length === 0 &&
        letterParticlesRef.current.length === 0
      ) {
        const { width: w, height: h } = dimsRef.current;
        ctx.clearRect(0, 0, w, h);
        isLoopRunningRef.current = false;
        animFrameRef.current = null;
        return;
      }

      if (document.hidden) {
        lastFrameTime = now;
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min(2.2, Math.max(0.2, (now - lastFrameTime) / 16.667));
      lastFrameTime = now;

      const { width: w, height: h } = dimsRef.current;
      const isCompact = w < 640;
      const useFastRectSparks = isCompact || isLowEndHardware;

      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 1;

      // --- 1 & 2. Draw & Advance Active Crackers ---
      for (let c = 0; c < currentCrackers.length; c++) {
        const cracker = currentCrackers[c];
        const isFusing = now < cracker.fuseEndTime;

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
          ctx.fillStyle =
            cracker.type === 'sky_letters' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(16, 185, 129, 0.4)';
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

        if (isFusing) {
          if (cracker.fuseEndTime > cracker.startTime && !startedFuse.has(cracker.id)) {
            startedFuse.add(cracker.id);
            soundEngine.playFuseSizzle(
              Math.max(0.2, (cracker.fuseEndTime - cracker.startTime) / 1000)
            );
          }

          spawnSparks(
            cracker.x,
            cracker.y - 16,
            2,
            ['#FDE047', '#F97316', '#FFFFFF'],
            1.6,
            Math.PI * 2,
            0,
            0.06
          );
          if (!isLowEndHardware && Math.random() < 0.35) {
            spawnSmoke(cracker.x, cracker.y - 16, 1);
          }
          continue;
        }

        if (now > cracker.endTime) {
          startedFuse.delete(cracker.id);
          startedBurn.delete(cracker.id);
          firedSkyshotCounts.delete(cracker.id);
          onCrackerFinishRef.current(cracker.id);
          continue;
        }

        const burnDurationMs = Math.max(1, cracker.endTime - cracker.fuseEndTime);
        const burnElapsedMs = Math.max(0, now - cracker.fuseEndTime);
        const activeFraction = Math.max(0, Math.min(1, burnElapsedMs / burnDurationMs));

        if (!startedBurn.has(cracker.id)) {
          startedBurn.add(cracker.id);
          const burnDurationSec = burnDurationMs / 1000;

          if (cracker.type === 'charkhi') {
            soundEngine.playCharkhiSound(burnDurationSec);
          } else if (cracker.type === 'anar') {
            soundEngine.playAnarSound(burnDurationSec);
          } else if (cracker.type === 'phooljhadi') {
            soundEngine.playPhooljhadiSound(burnDurationSec);
          } else if (cracker.type === 'rocket' || cracker.type === 'sky_letters') {
            const targetSkyY =
              cracker.type === 'sky_letters'
                ? Math.max(85, h * 0.23)
                : Math.max(65, Math.min(h * 0.36, cracker.y - h * (0.38 + Math.random() * 0.14)));

            launchSingleRocket(
              cracker.id,
              cracker.x,
              cracker.y,
              targetSkyY,
              cracker.type === 'sky_letters' ? 0 : (Math.random() - 0.5) * 0.85,
              cracker.type === 'sky_letters' ? 58 : 52,
              cracker.colorScheme,
              { isLetterBurst: cracker.type === 'sky_letters' }
            );
          }
        }

        if (cracker.type === 'charkhi') {
          const rotSpeed = now * 0.038;
          for (let j = 0; j < 4; j++) {
            const jetAngle = rotSpeed + j * (Math.PI * 0.5);
            const jetX = cracker.x + Math.cos(jetAngle) * 18;
            const jetY = cracker.y + Math.sin(jetAngle) * 7;
            spawnSparks(
              jetX,
              jetY,
              4,
              cracker.colorScheme,
              6.4,
              0.35,
              jetAngle + Math.PI / 2,
              0.09
            );
          }

          if (!isLowEndHardware && Math.random() < 0.22) spawnSmoke(cracker.x, cracker.y, 1);

          const sprite = amberGlowSpriteRef.current;
          if (sprite) {
            const radius = isCompact ? 95 : 130;
            ctx.drawImage(
              sprite,
              cracker.x - radius,
              cracker.y - radius,
              radius * 2,
              radius * 2
            );
          }
        } else if (cracker.type === 'anar') {
          const power = Math.min(1.0, activeFraction * 2.1);
          const maxFountain = Math.min(260, h * 0.36);
          const fountainHeight = 100 + power * maxFountain;
          const sparkSpeed = Math.sqrt(fountainHeight * 0.38);

          spawnSparks(
            cracker.x,
            cracker.y - 18,
            Math.floor(8 + power * 11),
            cracker.colorScheme,
            sparkSpeed,
            0.6,
            -Math.PI / 2,
            0.24
          );

          if (!isLowEndHardware && Math.random() < 0.22) {
            spawnSmoke(cracker.x, cracker.y - fountainHeight * 0.5, 1);
          }

          ctx.beginPath();
          ctx.moveTo(cracker.x - 7, cracker.y - 18);
          ctx.lineTo(cracker.x + 7, cracker.y - 18);
          ctx.lineTo(cracker.x, cracker.y - 32 - power * 40);
          ctx.closePath();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.fill();

          const sprite = roseGlowSpriteRef.current;
          if (sprite) {
            const radius = isCompact ? 155 : 225;
            ctx.drawImage(
              sprite,
              cracker.x - radius,
              cracker.y - 50 - radius,
              radius * 2,
              radius * 2
            );
          }
        } else if (cracker.type === 'phooljhadi') {
          spawnSparks(cracker.x, cracker.y, 6, cracker.colorScheme, 3.8, Math.PI * 2, 0, 0.05);
        } else if (cracker.type === 'skyshot') {
          const shotInterval = 680;
          const shotIdx = Math.floor(burnElapsedMs / shotInterval);
          const lastFired = firedSkyshotCounts.get(cracker.id) ?? -1;

          if (shotIdx > lastFired && shotIdx <= 6) {
            firedSkyshotCounts.set(cracker.id, shotIdx);
            spawnSparks(
              cracker.x,
              cracker.y - 18,
              10,
              ['#F59E0B', '#EF4444'],
              5.2,
              0.4,
              -Math.PI / 2,
              0.1
            );
            if (!isLowEndHardware) spawnSmoke(cracker.x, cracker.y - 20, 2);

            const spreadX = Math.min(180, w * 0.25);
            const targetSkyX = Math.max(
              40,
              Math.min(w - 40, cracker.x + (Math.random() - 0.5) * spreadX)
            );
            const targetSkyY = Math.max(
              70,
              Math.min(h * 0.38, cracker.y - h * (0.34 + Math.random() * 0.14))
            );
            const shellFrames = 32;
            const vx = (targetSkyX - cracker.x) / shellFrames;

            launchSingleRocket(
              `${cracker.id}_shot_${shotIdx}`,
              cracker.x,
              cracker.y,
              targetSkyY,
              vx,
              shellFrames,
              cracker.colorScheme,
              { isSkyshotShell: true }
            );
          }
        }
      }

      // --- 3. Update & Render Ascending Rockets / Skyshot Shells ---
      for (let r = rocketsRef.current.length - 1; r >= 0; r--) {
        const rocket = rocketsRef.current[r];
        if (!rocket.hasExploded) {
          rocket.x += rocket.vx * dt;
          rocket.y += rocket.vy * dt;
          rocket.vy += rocket.gravity * dt;

          if (rocket.isSkyshotShell) {
            spawnSparks(
              rocket.x,
              rocket.y + 4,
              2,
              ['#FDE047', '#F59E0B', '#FFFFFF'],
              1.8,
              0.35,
              Math.PI / 2,
              0.04
            );
            ctx.fillStyle = '#FDE047';
            ctx.beginPath();
            ctx.arc(rocket.x, rocket.y, 3.2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            spawnSparks(
              rocket.x,
              rocket.y + 6,
              3,
              ['#F97316', '#FBBF24', '#71717A'],
              2.2,
              0.4,
              Math.PI / 2,
              0.02
            );
            if (!isLowEndHardware) spawnSmoke(rocket.x, rocket.y + 8, 1);
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
          }

          if (rocket.y <= rocket.targetY || rocket.vy >= -0.8) {
            rocket.hasExploded = true;
            rocket.stopSound?.();

            spawnExplosion(
              rocket.x,
              rocket.y,
              rocket.colorScheme,
              rocket.isSkyshotShell ? 90 : 110
            );

            if (rocket.isLetterBurst) {
              spawnSkyLetters(rocket.x, rocket.y);
              soundEngine.playHappyDiwaliBlast(true);
            } else if (rocket.isSkyshotShell) {
              soundEngine.playSkyshotExplosion(1.0);
            } else {
              soundEngine.playSkyshotExplosion(1.3);
            }

            swapRemove(rocketsRef.current, r);
          }
        }
      }

      // --- 4 & 5. Additive Spark & Sky Calligraphy Pass ---
      const hasLetters = letterParticlesRef.current.length > 0;
      const hasSparks = particlesRef.current.length > 0;

      if (hasLetters || hasSparks) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        const letters = letterParticlesRef.current;
        for (let lp = letters.length - 1; lp >= 0; lp--) {
          const p = letters[lp];
          const age = now - p.spawnTime;

          if (age > p.durationMs) {
            swapRemove(letters, lp);
            continue;
          }

          const followRate = Math.min(1, 0.12 * dt);
          p.x += (p.targetX - p.x) * followRate;
          p.y += (p.targetY - p.y) * followRate;

          if (age > p.durationMs - 1500) {
            p.targetY += 0.6 * dt;
            p.alpha = Math.max(0, (p.durationMs - age) / 1500);
          } else {
            p.alpha = 0.85 + Math.sin(now * 0.012 + lp) * 0.15;
          }

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          if (useFastRectSparks) {
            ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        const dragFactor = Math.max(0.85, 1 - 0.015 * dt);
        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += p.gravity * dt;
          p.vx *= dragFactor;
          p.alpha -= p.decay * dt;

          if (p.alpha <= 0.02 || p.y > h + 20) {
            swapRemove(particles, i);
            continue;
          }

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          if (useFastRectSparks && !p.isSmoke) {
            ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    const startLoop = () => {
      if (isLoopRunningRef.current) return;
      isLoopRunningRef.current = true;
      lastFrameTime = performance.now();
      animFrameRef.current = requestAnimationFrame(render);
    };

    startLoopRef.current = startLoop;

    if (
      activeCrackersRef.current.length > 0 ||
      particlesRef.current.length > 0 ||
      rocketsRef.current.length > 0 ||
      letterParticlesRef.current.length > 0
    ) {
      startLoop();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
      isLoopRunningRef.current = false;
      startLoopRef.current = null;
      rocketsRef.current.forEach((r) => r.stopSound?.());
      rocketsRef.current = [];
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-30"
    />
  );
};
