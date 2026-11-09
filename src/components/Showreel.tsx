import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX, RotateCcw, Award } from 'lucide-react';

interface ShowreelProps {
  onComplete: () => void;
  onSkip: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Showreel: React.FC<ShowreelProps> = ({
  onComplete,
  onSkip,
  isMuted,
  onToggleMute
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const TOTAL_DURATION = 15.0; // 15 seconds

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const pausedTimeRef = useRef<number>(0);

  // Showreel chapters
  const chapters = [
    { start: 0, end: 3.8, title: 'Parametric Geometry & Spatial Vectors', num: '01' },
    { start: 3.8, end: 7.5, title: 'Procedural Fireworks & Volumetric Embers', num: '02' },
    { start: 7.5, end: 11.2, title: 'Luxury Interaction Systems & Audio Sync', num: '03' },
    { start: 11.2, end: 15.0, title: 'Immersive Courtyard Experience', num: '04' }
  ];

  const currentChapter =
    chapters.find((c) => currentTime >= c.start && currentTime <= c.end) || chapters[3];

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

    // Dynamic 3D Geodesic points
    const pointsCount = 48;
    const spherePoints = Array.from({ length: pointsCount }, (_, i) => {
      const phi = Math.acos(-1 + (2 * i) / pointsCount);
      const theta = Math.sqrt(pointsCount * Math.PI) * phi;
      return {
        x: Math.cos(theta) * Math.sin(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(phi)
      };
    });

    // Pyro particles for Act 2
    const pyroParticles = Array.from({ length: 300 }, () => ({
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.5) * 14,
      color: ['#F59E0B', '#FDE047', '#EC4899', '#3B82F6', '#10B981'][Math.floor(Math.random() * 5)],
      life: Math.random(),
      size: Math.random() * 3 + 1
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

      ctx.fillStyle = 'rgba(6, 6, 9, 0.28)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      ctx.save();
      ctx.translate(cx, cy);

      // --- ACT 1: PARAMETRIC 3D GEOMETRY (0.0s - 3.8s) ---
      if (elapsed < 3.8) {
        const rotY = elapsed * 1.6;
        const rotX = elapsed * 0.9;
        const radius = 170 + Math.sin(elapsed * 3) * 20;

        // Draw connections
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.lineWidth = 1;

        const projected = spherePoints.map((pt) => {
          // 3D rotation
          const y1 = pt.y * Math.cos(rotX) - pt.z * Math.sin(rotX);
          const z1 = pt.y * Math.sin(rotX) + pt.z * Math.cos(rotX);
          const x2 = pt.x * Math.cos(rotY) + z1 * Math.sin(rotY);
          const z2 = -pt.x * Math.sin(rotY) + z1 * Math.cos(rotY);

          const scale = 360 / (360 + z2 * radius * 0.7);
          return {
            x: x2 * radius * scale,
            y: y1 * radius * scale,
            scale,
            z: z2
          };
        });

        for (let i = 0; i < projected.length; i++) {
          for (let j = i + 1; j < projected.length; j++) {
            const dx = projected[i].x - projected[j].x;
            const dy = projected[i].y - projected[j].y;
            const dist = Math.hypot(dx, dy);
            if (dist < 85) {
              ctx.beginPath();
              ctx.moveTo(projected[i].x, projected[i].y);
              ctx.lineTo(projected[j].x, projected[j].y);
              ctx.stroke();
            }
          }
        }

        // Vertices
        projected.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3 * p.scale, 0, Math.PI * 2);
          ctx.fillStyle = p.z > 0 ? '#FDE047' : 'rgba(245, 158, 11, 0.4)';
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 12 * p.scale;
          ctx.fill();
        });
      }

      // --- ACT 2: VOLUMETRIC PYRO SIMULATION (3.8s - 7.5s) ---
      else if (elapsed < 7.5) {
        const actElapsed = elapsed - 3.8;
        const cycleTime = actElapsed % 1.8;

        pyroParticles.forEach((p) => {
          const t = cycleTime;
          const px = p.vx * t * 45;
          const py = p.vy * t * 45 + 0.5 * 90 * t * t; // Gravity arc
          const alpha = Math.max(0, 1 - cycleTime / 1.7);

          ctx.beginPath();
          ctx.arc(px, py, p.size * alpha, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 14;
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;
      }

      // --- ACT 3: LUXURY INTERACTION CHOREOGRAPHY (7.5s - 11.2s) ---
      else if (elapsed < 11.2) {
        const actElapsed = elapsed - 7.5;
        const numCards = 5;

        for (let i = 0; i < numCards; i++) {
          const offset = i - (numCards - 1) / 2;
          const springX = offset * 110 + Math.sin(actElapsed * 4 + i) * 15;
          const springY = Math.cos(actElapsed * 3 + i * 0.8) * 35;
          const rot = offset * 0.12 + Math.sin(actElapsed * 2) * 0.05;

          ctx.save();
          ctx.translate(springX, springY);
          ctx.rotate(rot);

          // Card surface
          ctx.fillStyle = 'rgba(24, 24, 27, 0.85)';
          ctx.strokeStyle = i === 2 ? 'rgba(245, 158, 11, 0.9)' : 'rgba(63, 63, 70, 0.6)';
          ctx.lineWidth = i === 2 ? 2 : 1;
          ctx.shadowColor = i === 2 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = i === 2 ? 24 : 10;

          ctx.beginPath();
          ctx.roundRect(-42, -65, 84, 130, 12);
          ctx.fill();
          ctx.stroke();

          // Card content
          ctx.fillStyle = '#FDE047';
          ctx.beginPath();
          ctx.arc(0, -30, 10, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(-24, 0, 48, 4);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillRect(-18, 14, 36, 3);

          ctx.restore();
        }
      }

      // --- ACT 4: TRANSITION TO FESTIVE ARENA (11.2s - 15.0s) ---
      else {
        const actElapsed = elapsed - 11.2;
        const zoom = 1 + actElapsed * 0.8;
        ctx.scale(zoom, zoom);

        // Tunnel of glowing festive rings
        for (let ring = 1; ring <= 8; ring++) {
          const r = ring * 45 + Math.sin(actElapsed * 5 + ring) * 10;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(245, 158, 11, ${0.7 - ring * 0.08})`;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 18;
          ctx.stroke();
        }

        ctx.textAlign = 'center';
        ctx.font = '800 36px "Outfit", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 10;
        ctx.fillText('ENTERING CRACKER ARENA', 0, 10);
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

  const restartShowreel = () => {
    startTimeRef.current = performance.now();
    setCurrentTime(0);
    setIsPlaying(true);
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none flex flex-col justify-between">
      {/* Background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Modern Top Showreel Header */}
      <div className="relative z-20 flex items-center justify-between px-6 md:px-10 py-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-white">
              MOTION DESIGN SHOWREEL
            </div>
            <div className="text-xs text-zinc-400">
              Opus 5.5 Portfolio &amp; Technical Artistry
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMute}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 rounded-lg transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            <span>{isMuted ? 'Muted' : 'Sound ON'}</span>
          </button>

          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-all shadow-lg shadow-amber-500/20"
          >
            <span>Enter Cracker Arena</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Dynamic Chapter Badge */}
      <div className="relative z-20 self-center px-6 py-2.5 bg-zinc-950/70 backdrop-blur-md border border-zinc-800/80 rounded-xl text-center flex items-center gap-3 max-w-lg">
        <span className="text-xs font-bold text-amber-400 font-mono">
          ACT {currentChapter.num}
        </span>
        <span className="text-zinc-600">·</span>
        <span className="text-xs font-medium text-zinc-200">
          {currentChapter.title}
        </span>
      </div>

      {/* Bottom Timeline & Controls */}
      <div className="relative z-20 px-6 md:px-12 py-8 flex flex-col gap-3 max-w-4xl mx-auto w-full">
        {/* Progress bar with chapter markers */}
        <div className="relative w-full bg-zinc-900/80 rounded-full h-2 overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-yellow-400 transition-all duration-100 ease-linear"
            style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
          />
        </div>

        {/* Chapter marker ticks */}
        <div className="flex justify-between text-[11px] text-zinc-500 font-mono px-1">
          <span>01 Geometry</span>
          <span>02 Pyro Dynamics</span>
          <span>03 Interaction Sync</span>
          <span>04 Arena</span>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1 hover:text-white transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={restartShowreel}
              className="p-1 hover:text-white transition-colors"
              title="Restart Showreel"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span>
              00:{Math.floor(currentTime).toString().padStart(2, '0')} / 00:15
            </span>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <span>60 FPS Vector Motion</span>
            <span>·</span>
            <span>Web Audio Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
