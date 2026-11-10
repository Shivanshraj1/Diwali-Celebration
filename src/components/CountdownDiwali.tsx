import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Flame } from 'lucide-react';
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

export const CountdownDiwali: React.FC<CountdownDiwaliProps> = ({
  onEnterTerrace
}) => {
  const [countdown, setCountdown] = useState<number | 'diwali'>(3);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<SkyParticle[]>([]);
  const rocketsRef = useRef<RocketShot[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Play first tick
    soundEngine.playCountdownTick(3);

    const timer2 = setTimeout(() => {
      setCountdown(2);
      soundEngine.playCountdownTick(2);
    }, 1000);

    const timer1 = setTimeout(() => {
      setCountdown(1);
      soundEngine.playCountdownTick(1);
    }, 2000);

    const timerDiwali = setTimeout(() => {
      setCountdown('diwali');
      soundEngine.playHappyDiwaliBlast();
      soundEngine.playSkyshotSound(6);
      launchSkyshots();
    }, 3000);

    return () => {
      clearTimeout(timer2);
      clearTimeout(timer1);
      clearTimeout(timerDiwali);
    };
  }, []);

  // Launch sequential background skyshot fireworks
  const launchSkyshots = () => {
    const colorPalettes = [
      ['#F59E0B', '#FDE047', '#FEF08A'],
      ['#EF4444', '#F87171', '#FDE047'],
      ['#10B981', '#34D399', '#A7F3D0'],
      ['#8B5CF6', '#C084FC', '#F472B6'],
      ['#38BDF8', '#7DD3FC', '#FFFFFF'],
      ['#EC4899', '#F43F5E', '#FDE047']
    ];

    colorPalettes.forEach((palette, idx) => {
      setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const startX = w * (0.15 + idx * 0.14);
        const targetY = h * (0.12 + Math.random() * 0.22);

        rocketsRef.current.push({
          x: startX,
          y: h + 10,
          targetY,
          vy: -13 - Math.random() * 3,
          colorScheme: palette,
          exploded: false
        });
      }, idx * 350);
    });
  };

  // Canvas render loop for background skyshots
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const spawnExplosion = (x: number, y: number, colors: string[]) => {
      const starCount = 110;
      for (let i = 0; i < starCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 2.5;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: 0.012 + Math.random() * 0.016,
          size: Math.random() * 3.2 + 1.2
        });
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Update & draw rising skyshot rockets
      for (let r = rocketsRef.current.length - 1; r >= 0; r--) {
        const rocket = rocketsRef.current[r];
        if (!rocket.exploded) {
          rocket.y += rocket.vy;
          rocket.vy += 0.05;

          // Rocket plume
          ctx.fillStyle = '#FDE047';
          ctx.beginPath();
          ctx.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2);
          ctx.fill();

          // Spark trail
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
            rocketsRef.current.splice(r, 1);
          }
        }
      }

      // 2. Update & draw explosion stars with glow
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // Gravity
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
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center select-none">
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/50 via-zinc-950 to-black pointer-events-none" />

      {/* Skyshots Particle Canvas Bursting in Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Floating ambient embers & sparks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {Array.from({ length: 45 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-400"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3
            }}
            animate={{
              y: [0, -50 - Math.random() * 70],
              opacity: [0.2, 0.9, 0.1],
              scale: [1, 1.4, 0.8]
            }}
            transition={{
              duration: 2.4 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Top Right Skip Button for instant entrance on mobile or desktop */}
      <button
        onClick={onEnterTerrace}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-zinc-900/85 hover:bg-zinc-800 border border-amber-500/35 text-amber-300 text-xs font-semibold backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/60"
        title="Directly enter Diwali celebration"
      >
        <span>Skip to Celebration</span>
        <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
      </button>

      <AnimatePresence mode="wait">
        {typeof countdown === 'number' ? (
          <motion.div
            key={countdown}
            initial={{ scale: 0.2, opacity: 0, filter: 'blur(12px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{ scale: 2.2, opacity: 0, filter: 'blur(16px)' }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative z-20 flex flex-col items-center justify-center text-center px-4"
          >
            {/* Glowing shockwave ring */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0.95 }}
              animate={{ scale: 2.6, opacity: 0 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              className="absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full border-2 border-amber-400/80 shadow-[0_0_60px_rgba(245,158,11,0.7)]"
            />

            {/* Giant countdown numeral with responsive size */}
            <h1 className="text-7xl sm:text-9xl md:text-[13rem] font-black font-display tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-600 drop-shadow-[0_0_40px_rgba(245,158,11,0.75)] select-none">
              {countdown}
            </h1>

            <p className="mt-3 sm:mt-4 text-[11px] sm:text-xs md:text-sm font-medium tracking-[0.25em] sm:tracking-[0.35em] text-amber-300/90 uppercase font-sans">
              Igniting Festival of Lights
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="diwali-greeting"
            initial={{ scale: 0.8, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
            className="relative z-20 max-w-3xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center"
          >
            {/* Traditional glowing Diya emblem */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-500 to-rose-500 p-0.5 shadow-[0_0_45px_rgba(245,158,11,0.8)] mb-4 sm:mb-6 flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
                <Flame className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 fill-amber-400 animate-pulse" />
              </div>
            </motion.div>

            {/* Hindi greeting */}
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-xl md:text-2xl font-serif text-amber-300/95 tracking-widest mb-1.5 sm:mb-2 font-festive"
            >
              ॥ शुभ दीपावली ॥
            </motion.span>

            {/* Vibrant English Title with responsive typography */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-4xl sm:text-6xl md:text-8xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 drop-shadow-[0_0_50px_rgba(245,158,11,0.7)]"
            >
              HAPPY DIWALI
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mt-4 sm:mt-6 text-xs sm:text-base md:text-lg text-zinc-300 max-w-xl font-light leading-relaxed text-balance"
            >
              May the divine festival of lights illuminate your life with infinite joy, good health, peace, prosperity, and togetherness.
            </motion.p>

            {/* Direct button to enter the celebration */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <button
                onClick={onEnterTerrace}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 text-xs sm:text-sm font-bold text-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 rounded-2xl shadow-2xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Enter Diwali Celebration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
