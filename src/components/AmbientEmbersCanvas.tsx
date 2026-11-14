import React, { useEffect, useRef } from 'react';

interface AmbientEmbersCanvasProps {
  width: number;
  height: number;
  paused?: boolean;
  celebrationBoost?: boolean;
}

const MAX_POOL_SIZE = 72;

interface SpriteSpec {
  core: string;
  mid: string;
  outer: string;
}

const SPRITE_SPECS: SpriteSpec[] = [
  // 0: Pale Champagne Golden Dust
  {
    core: 'rgba(255, 255, 255, 0.92)',
    mid: 'rgba(254, 240, 138, 0.52)',
    outer: 'rgba(253, 224, 71, 0)'
  },
  // 1: Rich Festive Gold Dust
  {
    core: 'rgba(254, 249, 195, 0.88)',
    mid: 'rgba(251, 191, 36, 0.48)',
    outer: 'rgba(245, 158, 11, 0)'
  },
  // 2: Saffron Hot Ember
  {
    core: 'rgba(255, 251, 235, 0.98)',
    mid: 'rgba(251, 146, 60, 0.72)',
    outer: 'rgba(234, 88, 12, 0)'
  },
  // 3: Crimson-Amber Rising Ember
  {
    core: 'rgba(254, 240, 138, 0.95)',
    mid: 'rgba(249, 115, 22, 0.68)',
    outer: 'rgba(220, 38, 38, 0)'
  }
];

function createGlowSprite(spec: SpriteSpec): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const sprite = document.createElement('canvas');
  sprite.width = 32;
  sprite.height = 32;
  const sCtx = sprite.getContext('2d');
  if (!sCtx) return null;

  const grad = sCtx.createRadialGradient(16, 16, 0.5, 16, 16, 16);
  grad.addColorStop(0, spec.core);
  grad.addColorStop(0.28, spec.mid);
  grad.addColorStop(1, spec.outer);

  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 32, 32);
  return sprite;
}

/**
 * Zero-allocation Structure-of-Arrays (SoA) rAF particle engine rendering
 * floating warm embers and golden dust motes behind interactive fireworks.
 */
export const AmbientEmbersCanvas: React.FC<AmbientEmbersCanvasProps> = React.memo(
  ({ width, height, paused = false, celebrationBoost = false }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const spritesRef = useRef<(HTMLCanvasElement | null)[]>([]);
    const dimsRef = useRef({ width, height });
    const pausedRef = useRef(paused);
    const boostRef = useRef(celebrationBoost);

    // Pre-allocated TypedArray particle pool (zero GC churn per frame)
    const poolRef = useRef<{
      activeCount: number;
      kind: Uint8Array; // 0 = golden dust, 1 = rising ember
      spriteIdx: Uint8Array;
      x: Float32Array;
      y: Float32Array;
      vx: Float32Array;
      vy: Float32Array;
      size: Float32Array;
      baseAlpha: Float32Array;
      phase: Float32Array;
      freq: Float32Array;
      amp: Float32Array;
      life: Float32Array;
      lifeRate: Float32Array;
      initialized: boolean;
    }>({
      activeCount: 0,
      kind: new Uint8Array(MAX_POOL_SIZE),
      spriteIdx: new Uint8Array(MAX_POOL_SIZE),
      x: new Float32Array(MAX_POOL_SIZE),
      y: new Float32Array(MAX_POOL_SIZE),
      vx: new Float32Array(MAX_POOL_SIZE),
      vy: new Float32Array(MAX_POOL_SIZE),
      size: new Float32Array(MAX_POOL_SIZE),
      baseAlpha: new Float32Array(MAX_POOL_SIZE),
      phase: new Float32Array(MAX_POOL_SIZE),
      freq: new Float32Array(MAX_POOL_SIZE),
      amp: new Float32Array(MAX_POOL_SIZE),
      life: new Float32Array(MAX_POOL_SIZE),
      lifeRate: new Float32Array(MAX_POOL_SIZE),
      initialized: false
    });

    const animFrameRef = useRef<number | null>(null);
    const resumeLoopRef = useRef<(() => void) | null>(null);

    useEffect(() => {
      const prevW = Math.max(1, dimsRef.current.width);
      const prevH = Math.max(1, dimsRef.current.height);
      dimsRef.current = { width, height };

      // Smoothly remap existing particle positions on viewport resize
      const pool = poolRef.current;
      if (pool.initialized && (prevW !== width || prevH !== height)) {
        const scaleX = width / prevW;
        const scaleY = height / prevH;
        for (let i = 0; i < MAX_POOL_SIZE; i++) {
          pool.x[i] *= scaleX;
          pool.y[i] *= scaleY;
        }
        const isLowEnd =
          typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 4) <= 4;
        pool.activeCount =
          width < 640 ? (isLowEnd ? 24 : 36) : width < 1024 ? 50 : MAX_POOL_SIZE;
      }
      if (!pausedRef.current) {
        resumeLoopRef.current?.();
      }
    }, [width, height]);

    useEffect(() => {
      pausedRef.current = paused;
      if (!paused) {
        resumeLoopRef.current?.();
      }
    }, [paused]);

    useEffect(() => {
      boostRef.current = celebrationBoost;
    }, [celebrationBoost]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      if (spritesRef.current.length === 0) {
        spritesRef.current = SPRITE_SPECS.map(createGlowSprite);
      }

      const isLowEnd =
        typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 4) <= 4;
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

      const pool = poolRef.current;

      const seedParticle = (i: number, w: number, h: number, initialSeed: boolean) => {
        const isEmber = i % 5 < 2; // 40% warm rising embers, 60% golden dust motes
        pool.kind[i] = isEmber ? 1 : 0;

        if (isEmber) {
          pool.spriteIdx[i] = Math.random() > 0.45 ? 2 : 3;
          pool.x[i] = Math.random() * w;
          pool.y[i] = initialSeed
            ? h * (0.28 + Math.random() * 0.72)
            : h * (0.78 + Math.random() * 0.25);
          pool.vx[i] = (Math.random() - 0.45) * 0.24;
          pool.vy[i] = -(0.38 + Math.random() * 0.62);
          pool.size[i] = (w < 640 ? 6.5 : 8) + Math.random() * 7;
          pool.baseAlpha[i] = 0.42 + Math.random() * 0.45;
          pool.phase[i] = Math.random() * Math.PI * 2;
          pool.freq[i] = 0.018 + Math.random() * 0.025;
          pool.amp[i] = 0.22 + Math.random() * 0.35;
          pool.life[i] = initialSeed ? Math.random() : 0;
          pool.lifeRate[i] = 0.0022 + Math.random() * 0.0028;
        } else {
          pool.spriteIdx[i] = Math.random() > 0.4 ? 0 : 1;
          pool.x[i] = Math.random() * w;
          pool.y[i] = initialSeed ? Math.random() * h : h + 12;
          pool.vx[i] = (Math.random() - 0.5) * 0.16;
          pool.vy[i] = -(0.08 + Math.random() * 0.18);
          pool.size[i] = (w < 640 ? 4.5 : 5.5) + Math.random() * 5.5;
          pool.baseAlpha[i] = 0.22 + Math.random() * 0.36;
          pool.phase[i] = Math.random() * Math.PI * 2;
          pool.freq[i] = 0.01 + Math.random() * 0.016;
          pool.amp[i] = 0.12 + Math.random() * 0.22;
          pool.life[i] = initialSeed ? Math.random() : 0;
          pool.lifeRate[i] = 0.0014 + Math.random() * 0.0018;
        }
      };

      if (!pool.initialized) {
        const { width: initW, height: initH } = dimsRef.current;
        pool.activeCount =
          initW < 640 ? (isLowEnd ? 24 : 36) : initW < 1024 ? 50 : MAX_POOL_SIZE;
        for (let i = 0; i < MAX_POOL_SIZE; i++) {
          seedParticle(i, initW, initH, true);
        }
        pool.initialized = true;
      }

      let lastFrameTime = performance.now();
      let thermalBoost = 1.0;

      const drawFrame = (now: number, advanceSimulation: boolean) => {
        const { width: w, height: h } = dimsRef.current;
        if (w <= 0 || h <= 0) return;

        // Smoothly throttle ambient embers slightly during active fireworks on low-end/mobile so main fireworks never drop frames
        const elapsedMs = now - lastFrameTime;
        const compactOrLowEnd = w < 640 || isLowEnd;
        const targetIntervalMs =
          compactOrLowEnd && boostRef.current ? 26 : compactOrLowEnd ? 20 : 0;
        if (advanceSimulation && targetIntervalMs > 0 && elapsedMs < targetIntervalMs) {
          return;
        }

        const dt = advanceSimulation
          ? Math.min(2.4, Math.max(0.25, elapsedMs / 16.667))
          : 0;
        lastFrameTime = now;

        // Smooth thermal updraft multiplier when fireworks heat the courtyard air
        const targetThermal = boostRef.current ? 1.38 : 1.0;
        thermalBoost += (targetThermal - thermalBoost) * Math.min(1, 0.06 * Math.max(1, dt));

        ctx.clearRect(0, 0, w, h);

        const sprites = spritesRef.current;
        const count = pool.activeCount;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        for (let i = 0; i < count; i++) {
          if (advanceSimulation) {
            pool.phase[i] += pool.freq[i] * dt;
            const sway = Math.sin(pool.phase[i]) * pool.amp[i];

            if (pool.kind[i] === 1) {
              // Rising embers feel thermal breeze lift & gentle upward swirl
              pool.x[i] += (pool.vx[i] + sway) * dt;
              pool.y[i] += pool.vy[i] * thermalBoost * dt;
              pool.life[i] += pool.lifeRate[i] * dt;

              if (pool.life[i] >= 1 || pool.y[i] < -18) {
                seedParticle(i, w, h, false);
              }
            } else {
              // Golden dust floats lazily in multi-directional courtyard currents
              const verticalWave = Math.cos(pool.phase[i] * 0.75) * 0.09;
              pool.x[i] += (pool.vx[i] + sway) * dt;
              pool.y[i] += (pool.vy[i] * (0.9 + (thermalBoost - 1) * 0.45) + verticalWave) * dt;
              pool.life[i] += pool.lifeRate[i] * dt;
              if (pool.life[i] >= 1) pool.life[i] -= 1;

              if (pool.y[i] < -14) {
                pool.y[i] = h + 10;
                pool.x[i] = Math.random() * w;
              }
            }

            // Horizontal wrap cleanly across viewport edges
            if (pool.x[i] < -14) pool.x[i] = w + 12;
            else if (pool.x[i] > w + 14) pool.x[i] = -12;
          }

          let alpha: number;
          let drawSize = pool.size[i];

          if (pool.kind[i] === 1) {
            // Smooth fade-in (first 15%) and fade-out (last 35%) + warm ember flicker
            const l = pool.life[i];
            const envelope =
              l < 0.15 ? l / 0.15 : l > 0.65 ? Math.max(0, (1 - l) / 0.35) : 1;
            const flicker = 0.72 + 0.28 * Math.sin(pool.phase[i] * 3.1);
            alpha = pool.baseAlpha[i] * envelope * flicker;
            drawSize *= 0.8 + 0.25 * envelope;
          } else {
            // Soft golden dust shimmer
            const shimmer = 0.5 + 0.5 * Math.sin(pool.phase[i] * 1.9);
            alpha = pool.baseAlpha[i] * (0.45 + 0.55 * shimmer);
          }

          if (alpha <= 0.015) continue;

          const sprite = sprites[pool.spriteIdx[i]];
          if (!sprite) continue;

          ctx.globalAlpha = alpha;
          const half = drawSize * 0.5;
          ctx.drawImage(sprite, pool.x[i] - half, pool.y[i] - half, drawSize, drawSize);
        }

        ctx.restore();
      };

      const render = (now: number) => {
        if (pausedRef.current || document.hidden) {
          animFrameRef.current = null;
          return;
        }
        drawFrame(now, !prefersReducedMotion);
        if (!prefersReducedMotion) {
          animFrameRef.current = requestAnimationFrame(render);
        } else {
          animFrameRef.current = null;
        }
      };

      const startLoop = () => {
        if (pausedRef.current || document.hidden) return;
        if (prefersReducedMotion) {
          drawFrame(performance.now(), false);
          return;
        }
        if (animFrameRef.current !== null) return;
        lastFrameTime = performance.now();
        animFrameRef.current = requestAnimationFrame(render);
      };

      resumeLoopRef.current = startLoop;

      const handleVisibilityChange = () => {
        if (document.hidden) {
          if (animFrameRef.current !== null) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
          }
        } else {
          startLoop();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      startLoop();

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (animFrameRef.current !== null) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
        resumeLoopRef.current = null;
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-[25]"
      />
    );
  }
);
