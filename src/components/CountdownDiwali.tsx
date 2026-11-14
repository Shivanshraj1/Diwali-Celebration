import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Flame, Volume2, RotateCcw } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface CountdownDiwaliProps {
  onEnterTerrace: () => void;
}

interface SkyParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
}

interface RocketShot {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  colorScheme: string[];
  exploded: boolean;
}

type CountdownStep = 3 | 2 | 1 | 'diwali';

const BEAT_MS = 1000;
const SKYSHOT_INTERVAL_MS = 320;
const SKYSHOT_PALETTES: string[][] = [
  ['#F59E0B', '#FDE047', '#FEF08A'],
  ['#EF4444', '#F87171', '#FDE047'],
  ['#10B981', '#34D399', '#A7F3D0'],
  ['#8B5CF6', '#C084FC', '#F472B6'],
  ['#38BDF8', '#7DD3FC', '#FFFFFF'],
  ['#EC4899', '#F43F5E', '#FDE047']
];

function swapRemove<T>(arr: T[], idx: number): void {
  const last = arr.length - 1;
  if (idx !== last) arr[idx] = arr[last];
  arr.pop();
}

export const CountdownDiwali: React.FC<CountdownDiwaliProps> = ({
  onEnterTerrace
}) => {
  const [countdown, setCountdown] = useState<CountdownStep>(3);
  // Sequence run counter ensures Replay / Sound-Unlock remounts beat 3 & its ring cleanly from t=0
  const [sequenceRunId, setSequenceRunId] = useState<number>(1);
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(() =>
    soundEngine.isContextRunning()
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<SkyParticle[]>([]);
  const rocketsRef = useRef<RocketShot[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const beatStartRef = useRef<number>(performance.now());
  const sequenceStepRef = useRef<CountdownStep>(3);
  const diwaliStartRef = useRef<number | null>(null);
  const nextRocketIdxRef = useRef<number>(0);

  const startSequence = useCallback((playInitialSound = true) => {
    rocketsRef.current = [];
    particlesRef.current = [];
    diwaliStartRef.current = null;
    nextRocketIdxRef.current = 0;

    beatStartRef.current = performance.now();
    sequenceStepRef.current = 3;
    setCountdown(3);
    setSequenceRunId((id) => id + 1);

    if (playInitialSound && soundEngine.isContextRunning()) {
      soundEngine.playCountdownTick(3);
    }
  }, []);

  // Initial mount: unlock Web Audio if permitted, then anchor visual + audio beat 3 in lockstep
  useEffect(() => {
    let active = true;

    const alreadyRunning = soundEngine.isContextRunning();
    startSequence(alreadyRunning);

    if (!alreadyRunning) {
      void soundEngine.unlock().then((ok) => {
        if (!active) return;
        setAudioUnlocked(ok);
        if (ok) {
          // AudioContext resumed cleanly via autoplay policy; restart beat 3 so audio & visual start at exact t=0
          startSequence(true);
        }
      });
    }

    return () => {
      active = false;
    };
  }, [startSequence]);

  const handleUnlockAndSync = useCallback(async () => {
    const ok = await soundEngine.unlock();
    setAudioUnlocked(ok);
    if (ok) {
      startSequence(true);
    }
  }, [startSequence]);

  // Unlock automatically on first user gesture anywhere on screen if browser blocked autoplay
  useEffect(() => {
    if (audioUnlocked) return;

    const handleFirstGesture = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-skip-sync-restart="true"]')) return;
      void handleUnlockAndSync();
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, [audioUnlocked, handleUnlockAndSync]);

  // Unified rAF loop driving beat transitions, skyshot salvo spawns, and frame-locked explosion audio
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let hiddenAt: number | null = null;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenAt = performance.now();
      } else if (hiddenAt !== null) {
        const pausedDuration = performance.now() - hiddenAt;
        beatStartRef.current += pausedDuration;
        if (diwaliStartRef.current !== null) {
          diwaliStartRef.current += pausedDuration;
        }
        lastFrameTime = performance.now();
        hiddenAt = null;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const spawnExplosion = (x: number, y: number, colors: string[]) => {
      const starCount = width < 640 ? 60 : 105;
      for (let i = 0; i < starCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (width < 640 ? 5.2 : 7) + 2.2;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: 0.012 + Math.random() * 0.016,
          size: Math.random() * 3 + 1.2
        });
      }
    };

    const spawnSingleRocket = (idx: number) => {
      const palette = SKYSHOT_PALETTES[idx % SKYSHOT_PALETTES.length];
      const startX = width * (0.14 + idx * 0.14);
      const targetY = height * (0.12 + Math.random() * 0.22);

      rocketsRef.current.push({
        x: startX,
        y: height + 10,
        targetY,
        vy: -(height * 0.02 + 4),
        colorScheme: palette,
        exploded: false
      });

      // Fires in the exact rendered frame this rocket enters the canvas
      soundEngine.playSkyshotLaunch();
    };

    let lastFrameTime = performance.now();

    const render = (now: number) => {
      if (document.hidden) {
        lastFrameTime = now;
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min(2.2, Math.max(0.2, (now - lastFrameTime) / 16.667));
      lastFrameTime = now;

      // Advance at most ONE step per full BEAT_MS dwell so 3 -> 2 -> 1 is never skipped or shortened
      const stepElapsed = now - beatStartRef.current;
      if (sequenceStepRef.current !== 'diwali' && stepElapsed >= BEAT_MS) {
        // Carry over tiny sub-frame jitter (< 25ms) without letting large stalls cascade multiple skips
        const overshoot = Math.min(25, stepElapsed - BEAT_MS);
        beatStartRef.current = now - overshoot;

        if (sequenceStepRef.current === 3) {
          sequenceStepRef.current = 2;
          setCountdown(2);
          soundEngine.playCountdownTick(2);
        } else if (sequenceStepRef.current === 2) {
          sequenceStepRef.current = 1;
          setCountdown(1);
          soundEngine.playCountdownTick(1);
        } else if (sequenceStepRef.current === 1) {
          sequenceStepRef.current = 'diwali';
          diwaliStartRef.current = now;
          nextRocketIdxRef.current = 0;
          setCountdown('diwali');
          soundEngine.playHappyDiwaliBlast(false);
        }
      }

      // Frame-synchronized rocket salvo launches once Happy Diwali greeting begins
      if (
        sequenceStepRef.current === 'diwali' &&
        diwaliStartRef.current !== null &&
        nextRocketIdxRef.current < SKYSHOT_PALETTES.length
      ) {
        const diwaliElapsed = now - diwaliStartRef.current;
        if (diwaliElapsed >= nextRocketIdxRef.current * SKYSHOT_INTERVAL_MS) {
          spawnSingleRocket(nextRocketIdxRef.current);
          nextRocketIdxRef.current += 1;
        }
      }

      ctx.clearRect(0, 0, width, height);

      for (let r = rocketsRef.current.length - 1; r >= 0; r--) {
        const rocket = rocketsRef.current[r];
        if (!rocket.exploded) {
          rocket.y += rocket.vy * dt;
          rocket.vy += 0.05 * dt;

          ctx.fillStyle = '#FDE047';
          ctx.beginPath();
          ctx.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2);
          ctx.fill();

          for (let s = 0; s < 2; s++) {
            particlesRef.current.push({
              x: rocket.x + (Math.random() - 0.5) * 4,
              y: rocket.y + Math.random() * 6,
              vx: (Math.random() - 0.5) * 1.2,
              vy: 2 + Math.random() * 2,
              color: '#F59E0B',
              alpha: 0.8,
              decay: 0.04,
              size: 2
            });
          }

          if (rocket.y <= rocket.targetY || rocket.vy >= -1) {
            rocket.exploded = true;
            spawnExplosion(rocket.x, rocket.y, rocket.colorScheme);
            // Frame-exact burst sound matching the visual explosion frame
            soundEngine.playSkyshotExplosion(0.95);
            swapRemove(rocketsRef.current, r);
          }
        }
      }

      if (particlesRef.current.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const dragFactor = Math.max(0.85, 1 - 0.015 * dt);
        const isCompact = width < 640;

        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 0.15 * dt;
          p.vx *= dragFactor;
          p.alpha -= p.decay * dt;

          if (p.alpha <= 0.02 || p.y > height + 20) {
            swapRemove(particlesRef.current, i);
            continue;
          }

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          if (isCompact) {
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

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden flex items-center justify-center select-none px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/50 via-zinc-950 to-black pointer-events-none" />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Top Left Audio Unlock / Replay Control (>= 44px touch hitbox) */}
      <div className="absolute top-3 left-3 sm:top-6 sm:left-6 z-30 flex items-center gap-2">
        {!audioUnlocked ? (
          <button
            type="button"
            data-skip-sync-restart="true"
            onClick={(e) => {
              e.stopPropagation();
              void handleUnlockAndSync();
            }}
            className="min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-200 text-xs font-semibold sm:backdrop-blur-md transition-all active:scale-95 shadow-lg cursor-pointer animate-pulse"
          >
            <Volume2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Tap for Sound & Sync</span>
          </button>
        ) : (
          <button
            type="button"
            data-skip-sync-restart="true"
            onClick={(e) => {
              e.stopPropagation();
              startSequence(true);
            }}
            className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/35 text-amber-200 text-xs font-semibold sm:backdrop-blur-md transition-all active:scale-95 shadow-lg cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Replay 3-2-1</span>
          </button>
        )}
      </div>

      {/* Top Right Skip Button (>= 44px touch hitbox) */}
      <button
        type="button"
        data-skip-sync-restart="true"
        onClick={(e) => {
          e.stopPropagation();
          onEnterTerrace();
        }}
        className="min-h-[44px] absolute top-3 right-3 sm:top-6 sm:right-6 z-30 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 text-xs font-semibold sm:backdrop-blur-md transition-all active:scale-95 shadow-lg cursor-pointer"
      >
        <span>Skip</span>
        <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
      </button>

      {/* Full-viewport non-blocking AnimatePresence stage (initial enabled so beat 3 and its ring always animate in visibly) */}
      <div className="relative z-20 w-full h-full">
        <AnimatePresence>
          {typeof countdown === 'number' ? (
            <motion.div
              key={`beat-${sequenceRunId}-${countdown}`}
              initial={{ scale: 0.78, opacity: 0.2 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                scale: 1.5,
                opacity: 0,
                transition: { duration: 0.16, ease: 'easeOut' }
              }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4"
            >
              <div className="relative flex items-center justify-center">
                <motion.div
                  key={`ring-${sequenceRunId}-${countdown}`}
                  initial={{ scale: 0.55, opacity: 0.95 }}
                  animate={{ scale: 2.35, opacity: 0 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="absolute w-40 h-40 sm:w-64 sm:h-64 rounded-full border-2 border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.7)]"
                />
                <h1 className="relative px-4 py-2 text-8xl sm:text-9xl md:text-[12rem] leading-none font-black font-display tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-600 drop-shadow-[0_0_40px_rgba(245,158,11,0.75)]">
                  {countdown}
                </h1>
              </div>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-medium tracking-[0.22em] sm:tracking-[0.35em] text-amber-300/90 uppercase">
                Igniting Festival of Lights
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`diwali-greeting-${sequenceRunId}`}
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 overflow-y-auto scrollbar-none flex px-4 pt-16 pb-8"
            >
              <div className="m-auto max-w-2xl w-full text-center flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-500 to-rose-500 p-0.5 shadow-[0_0_45px_rgba(245,158,11,0.8)] mb-3 sm:mb-5 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
                    <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 fill-amber-400 animate-pulse" />
                  </div>
                </div>

                <span className="text-sm sm:text-xl font-serif text-amber-300/95 tracking-widest mb-1 font-festive">
                  ॥ शुभ दीपावली ॥
                </span>

                <h1 className="text-4xl sm:text-6xl md:text-8xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 drop-shadow-[0_0_50px_rgba(245,158,11,0.7)]">
                  HAPPY DIWALI
                </h1>

                <p className="mt-2.5 sm:mt-5 text-xs sm:text-base text-zinc-300 max-w-lg font-light leading-relaxed">
                  May the divine festival of lights illuminate your life with endless joy, peace, prosperity, and togetherness.
                </p>

                <div className="mt-5 sm:mt-8 w-full sm:w-auto">
                  <button
                    type="button"
                    data-skip-sync-restart="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEnterTerrace();
                    }}
                    className="min-h-[48px] w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 text-xs sm:text-sm font-bold text-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 rounded-2xl shadow-2xl shadow-amber-500/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 fill-black" />
                    <span>Enter Diwali Celebration</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
