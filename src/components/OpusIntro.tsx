import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, SkipForward, Play, Pause, RotateCcw } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface OpusIntroProps {
  onComplete: () => void;
  onSkip: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const OpusIntro: React.FC<OpusIntroProps> = ({
  onComplete,
  onSkip,
  isMuted,
  onToggleMute
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const TOTAL_DURATION = 10.0; // 10 seconds

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const pausedTimeRef = useRef<number>(0);

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

    // Particle field
    const particlesCount = 180;
    const particles = Array.from({ length: particlesCount }, () => ({
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      z: Math.random() * 800 + 100,
      radius: Math.random() * 2.2 + 0.8,
      speed: Math.random() * 3 + 1,
      angle: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.4 ? 42 : 12, // Gold vs Crimson
      alpha: Math.random() * 0.7 + 0.3
    }));

    const render = (now: number) => {
      if (!isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const elapsed = (now - startTimeRef.current) / 1000;
      setCurrentTime(Math.min(elapsed, TOTAL_DURATION));

      if (elapsed >= TOTAL_DURATION) {
        onComplete();
        return;
      }

      // Clear with motion blur trail
      ctx.fillStyle = 'rgba(4, 3, 6, 0.22)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      ctx.save();
      ctx.translate(cx, cy);

      // --- 1. Generative 3D Wireframe Rings / Torus Math ---
      const ringCount = 7;
      const progress = elapsed / TOTAL_DURATION;

      for (let r = 0; r < ringCount; r++) {
        const ringProgress = (r + 1) / ringCount;
        const ringRadius = 70 + r * 38 + Math.sin(elapsed * 2 + r) * 15;
        const tilt = Math.sin(elapsed * 0.9 + r * 0.4) * 0.75;
        const rot = elapsed * (0.8 + r * 0.2) * (r % 2 === 0 ? 1 : -1);

        ctx.save();
        ctx.rotate(rot);
        ctx.scale(1, Math.cos(tilt));

        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);

        // Color shifts from deep royal amber to luminous white-gold
        const alpha = Math.min(1, Math.max(0.15, Math.sin(elapsed * 1.5 + ringProgress * 3)));
        const strokeColor =
          r % 2 === 0
            ? `rgba(245, 158, 11, ${alpha * 0.8})`
            : `rgba(239, 68, 68, ${alpha * 0.6})`;

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = r === 3 ? 2.5 : 1.2;
        ctx.stroke();

        // Node points along rings
        const nodes = 12;
        for (let n = 0; n < nodes; n++) {
          const theta = (n / nodes) * Math.PI * 2 + elapsed * 1.2;
          const nx = Math.cos(theta) * ringRadius;
          const ny = Math.sin(theta) * ringRadius;

          ctx.beginPath();
          ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FDE047';
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 10;
          ctx.fill();
        }

        ctx.restore();
      }

      // --- 2. Kinetic Energy Ribbons & Lissajous Curves ---
      ctx.beginPath();
      const points = 120;
      for (let p = 0; p <= points; p++) {
        const t = (p / points) * Math.PI * 4;
        const freqX = 3 + Math.sin(elapsed * 0.4);
        const freqY = 2 + Math.cos(elapsed * 0.3);
        const amp = 160 + Math.sin(elapsed * 1.5) * 60;

        const x = Math.sin(t * freqX + elapsed * 1.5) * amp;
        const y = Math.cos(t * freqY + elapsed * 1.2) * amp * 0.65;

        if (p === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(253, 224, 71, ${0.4 + Math.sin(elapsed * 4) * 0.25})`;
      ctx.lineWidth = 2.0;
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 16;
      ctx.stroke();

      // --- 3. 3D Stars & Floating Golden Photons ---
      particles.forEach((p) => {
        p.z -= p.speed * (1 + progress * 4); // Accelerate towards viewer
        if (p.z <= 10) {
          p.z = 800;
          p.x = (Math.random() - 0.5) * width;
          p.y = (Math.random() - 0.5) * height;
        }

        const scale = 350 / p.z;
        const px = p.x * scale;
        const py = p.y * scale;

        ctx.beginPath();
        ctx.arc(px, py, p.radius * scale, 0, Math.PI * 2);
        ctx.fillStyle =
          p.hue === 42
            ? `rgba(253, 224, 71, ${p.alpha})`
            : `rgba(244, 63, 94, ${p.alpha})`;
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 8 * scale;
        ctx.fill();
      });

      // --- 4. Central Singularity / Core Flare ---
      const coreSize = 24 + Math.sin(elapsed * 6) * 8 + (progress > 0.8 ? (progress - 0.8) * 400 : 0);
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize * 3);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      gradient.addColorStop(0.2, 'rgba(253, 224, 71, 0.85)');
      gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, coreSize * 3, 0, Math.PI * 2);
      ctx.fill();

      // --- 5. Dynamic Kinetic Typography (Opus 5.5 Motion Identity) ---
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';

      // Phase 1 (0-3s): Introduction of Opus 5.5
      if (elapsed < 3.2) {
        const textAlpha = Math.min(1, elapsed * 1.2) * (elapsed > 2.5 ? 1 - (elapsed - 2.5) / 0.7 : 1);
        ctx.font = '800 52px "Outfit", sans-serif';
        ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
        ctx.letterSpacing = `${8 + elapsed * 4}px`;
        ctx.fillText('OPUS 5.5', 0, 110);

        ctx.font = '400 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = `rgba(253, 224, 71, ${textAlpha * 0.9})`;
        ctx.letterSpacing = '6px';
        ctx.fillText('CREATIVE MOTION ARCHITECT', 0, 140);
      }
      // Phase 2 (3.2-6.5s): Core Capability & Motion Power
      else if (elapsed < 6.8) {
        const textAlpha = Math.min(1, (elapsed - 3.2) * 1.5) * (elapsed > 6.0 ? 1 - (elapsed - 6.0) / 0.8 : 1);
        ctx.font = '700 40px "Outfit", sans-serif';
        ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
        ctx.letterSpacing = '5px';
        ctx.fillText('GENERATIVE CELEBRATION MATRIX', 0, 110);

        ctx.font = '400 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = `rgba(245, 158, 11, ${textAlpha * 0.9})`;
        ctx.letterSpacing = '5px';
        ctx.fillText('PHYSICS-DRIVEN AUDIOVISUAL CRAFT', 0, 140);
      }
      // Phase 3 (6.8-10s): Gateway to Diwali
      else {
        const textAlpha = Math.min(1, (elapsed - 6.8) * 1.8);
        ctx.font = '800 48px "Outfit", sans-serif';
        ctx.fillStyle = `rgba(253, 224, 71, ${textAlpha})`;
        ctx.letterSpacing = '6px';
        ctx.fillText('IGNITING DEEPAVALI', 0, 110);

        ctx.font = '400 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha * 0.85})`;
        ctx.letterSpacing = '6px';
        ctx.fillText('PREPARE FOR COUNTDOWN', 0, 140);
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, onComplete]);

  const togglePlay = () => {
    if (isPlaying) {
      pausedTimeRef.current = performance.now();
      setIsPlaying(false);
    } else {
      const pausedDuration = performance.now() - pausedTimeRef.current;
      startTimeRef.current += pausedDuration;
      setIsPlaying(true);
    }
  };

  const restartIntro = () => {
    startTimeRef.current = performance.now();
    setCurrentTime(0);
    setIsPlaying(true);
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none flex flex-col justify-between">
      {/* High-performance canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Subtle modern cinematic vignette */}
      <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_center,transparent_45%,rgba(0,0,0,0.85)_100%]" />

      {/* Top Header Controls */}
      <div className="relative z-20 flex items-center justify-between px-6 md:px-10 py-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tracking-wider text-amber-400">
            OPUS 5.5
          </span>
          <span className="text-zinc-600">·</span>
          <span className="text-xs font-normal tracking-wide text-zinc-400">
            KINETIC MOTION ENGINE
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onToggleMute}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 rounded-lg transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            <span>{isMuted ? 'Muted' : 'Sound ON'}</span>
          </button>

          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-all shadow-lg shadow-amber-500/20"
          >
            <span>Skip Intro</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Timeline Controls */}
      <div className="relative z-20 px-6 md:px-12 py-8 flex flex-col gap-3 max-w-4xl mx-auto w-full">
        {/* Progress bar */}
        <div className="w-full bg-zinc-900/80 rounded-full h-1.5 overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-yellow-300 transition-all duration-100 ease-linear"
            style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1 hover:text-white transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={restartIntro}
              className="p-1 hover:text-white transition-colors"
              title="Restart Intro"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span>
              00:{Math.floor(currentTime).toString().padStart(2, '0')} / 00:10
            </span>
          </div>

          <div className="flex items-center gap-2 text-zinc-500">
            <span>Dynamic Canvas Shader</span>
            <span>·</span>
            <span>60 FPS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
