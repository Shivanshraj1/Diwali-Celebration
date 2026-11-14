import React, { useEffect, useRef } from 'react';

export interface JoyBurstSignal {
  id: number;
  label: string;
}

interface ConfettiCanvasProps {
  width: number;
  height: number;
  burstSignal: JoyBurstSignal | null;
}

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  tiltAngle: number;
  tiltSpeed: number;
  wobblePhase: number;
  wobbleSpeed: number;
  shape: 0 | 1 | 2; // 0 = ribbon rect, 1 = diamond, 2 = gold disc
  gravity: number;
  drag: number;
}

const CONFETTI_COLORS = [
  '#FDE047', // bright gold
  '#F59E0B', // saffron amber
  '#EC4899', // festive rani pink
  '#10B981', // emerald
  '#38BDF8', // sky sparkle
  '#A855F7', // royal purple
  '#FB7185', // rose coral
  '#FFFFFF'  // crisp white flash
];

const MAX_ACTIVE_CONFETTI = 360;

function swapRemove<T>(arr: T[], idx: number): void {
  const last = arr.length - 1;
  if (idx !== last) arr[idx] = arr[last];
  arr.pop();
}

export const ConfettiCanvas: React.FC<ConfettiCanvasProps> = React.memo(
  ({ width, height, burstSignal }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const piecesRef = useRef<ConfettiPiece[]>([]);
    const animFrameRef = useRef<number | null>(null);
    const isRunningRef = useRef(false);
    const startLoopRef = useRef<(() => void) | null>(null);

    const dimsRef = useRef({ width, height });
    useEffect(() => {
      dimsRef.current = { width, height };
    }, [width, height]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      let lastFrameTime = performance.now();

      const handleVisibilityChange = () => {
        if (!document.hidden) {
          lastFrameTime = performance.now();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      const render = (now: number) => {
        const pieces = piecesRef.current;
        const { width: w, height: h } = dimsRef.current;

        if (pieces.length === 0) {
          ctx.clearRect(0, 0, w, h);
          isRunningRef.current = false;
          animFrameRef.current = null;
          return;
        }

        if (document.hidden) {
          lastFrameTime = now;
          animFrameRef.current = requestAnimationFrame(render);
          return;
        }

        const dt = Math.min(2.2, Math.max(0.25, (now - lastFrameTime) / 16.667));
        lastFrameTime = now;

        ctx.clearRect(0, 0, w, h);

        for (let i = pieces.length - 1; i >= 0; i--) {
          const p = pieces[i];
          const dragPow = Math.pow(p.drag, dt);
          p.vx *= dragPow;
          p.vy = p.vy * dragPow + p.gravity * dt;

          p.wobblePhase += p.wobbleSpeed * dt;
          p.rotation += p.rotationSpeed * dt;
          p.tiltAngle += p.tiltSpeed * dt;

          p.x += (p.vx + Math.sin(p.wobblePhase) * 0.9) * dt;
          p.y += p.vy * dt;

          // Fade gracefully in final bottom 15% of viewport
          if (p.y > h * 0.85) {
            p.alpha -= 0.032 * dt;
          }

          if (p.alpha <= 0.02 || p.y > h + 30 || p.x < -50 || p.x > w + 50) {
            swapRemove(pieces, i);
            continue;
          }

          const tiltScale = Math.max(0.2, Math.abs(Math.cos(p.tiltAngle)));

          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
          ctx.fillStyle = p.color;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          if (p.shape === 0) {
            // Tumbling confetti ribbon
            ctx.fillRect(-p.w * 0.5, (-p.h * tiltScale) * 0.5, p.w, p.h * tiltScale);
          } else if (p.shape === 1) {
            // Festive rotated diamond foil
            const r = p.w * 0.55;
            ctx.beginPath();
            ctx.moveTo(0, -r);
            ctx.lineTo(r * tiltScale, 0);
            ctx.lineTo(0, r);
            ctx.lineTo(-r * tiltScale, 0);
            ctx.closePath();
            ctx.fill();
          } else {
            // Gold disc shimmer
            ctx.beginPath();
            ctx.ellipse(0, 0, p.w * 0.45, p.w * 0.45 * tiltScale, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }

        animFrameRef.current = requestAnimationFrame(render);
      };

      const startLoop = () => {
        if (isRunningRef.current) return;
        isRunningRef.current = true;
        lastFrameTime = performance.now();
        animFrameRef.current = requestAnimationFrame(render);
      };

      startLoopRef.current = startLoop;

      if (piecesRef.current.length > 0) {
        startLoop();
      }

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (animFrameRef.current !== null) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
        isRunningRef.current = false;
        startLoopRef.current = null;
      };
    }, []);

    // Spawn 3-origin screen-wide confetti blast whenever burstSignal fires
    useEffect(() => {
      if (!burstSignal) return;

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      const { width: w, height: h } = dimsRef.current;
      const isCompact = w < 640;
      const isLowEnd =
        typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 4) <= 4;

      const totalDesired = isCompact ? (isLowEnd ? 75 : 100) : 175;
      const headroom = Math.max(0, MAX_ACTIVE_CONFETTI - piecesRef.current.length);
      const spawnCount = Math.min(totalDesired, headroom);
      if (spawnCount <= 0) return;

      const sideCount = Math.floor(spawnCount * 0.34);
      const canopyCount = spawnCount - sideCount * 2;

      const pushPiece = (
        x: number,
        y: number,
        vx: number,
        vy: number,
        gravity: number,
        drag: number
      ) => {
        const shapeRoll = Math.random();
        const shape: 0 | 1 | 2 = shapeRoll < 0.62 ? 0 : shapeRoll < 0.84 ? 1 : 2;
        piecesRef.current.push({
          x,
          y,
          vx,
          vy,
          w: (isCompact ? 6.5 : 8) + Math.random() * 5,
          h: (isCompact ? 4 : 4.5) + Math.random() * 4.5,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          alpha: 0.96,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.22,
          tiltAngle: Math.random() * Math.PI * 2,
          tiltSpeed: 0.08 + Math.random() * 0.14,
          wobblePhase: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.06 + Math.random() * 0.06,
          shape,
          gravity,
          drag
        });
      };

      const speedScale = isCompact ? 0.78 : 1.0;

      // 1. Left corner confetti cannon sweeping diagonally up-right
      for (let i = 0; i < sideCount; i++) {
        const angle = -Math.PI * (0.2 + Math.random() * 0.28);
        const speed = (10 + Math.random() * 11) * speedScale;
        pushPiece(
          w * (0.04 + Math.random() * 0.06),
          h * (0.78 + Math.random() * 0.12),
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          0.24,
          0.975
        );
      }

      // 2. Right corner confetti cannon sweeping diagonally up-left
      for (let i = 0; i < sideCount; i++) {
        const angle = -Math.PI * (0.52 + Math.random() * 0.28);
        const speed = (10 + Math.random() * 11) * speedScale;
        pushPiece(
          w * (0.9 + Math.random() * 0.06),
          h * (0.78 + Math.random() * 0.12),
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          0.24,
          0.975
        );
      }

      // 3. Top sky-wide celebration canopy shower
      for (let i = 0; i < canopyCount; i++) {
        pushPiece(
          Math.random() * w,
          -10 - Math.random() * (h * 0.18),
          (Math.random() - 0.5) * 4.5,
          2.2 + Math.random() * 4.8,
          0.11,
          0.985
        );
      }

      startLoopRef.current?.();
    }, [burstSignal]);

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-[35]"
      />
    );
  }
);
