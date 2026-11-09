import React, { useEffect, useRef } from 'react';

export type WeatherMode = 'starlit' | 'lanterns' | 'mist' | 'distant_fireworks';

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

interface DistantBurst {
  x: number;
  y: number;
  particles: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    alpha: number;
  }[];
  active: boolean;
}

export const DynamicWeatherSky: React.FC<DynamicWeatherSkyProps> = ({
  weatherMode,
  width,
  height
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

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

  // Initialize stars once or on significant resize
  useEffect(() => {
    const starColors = ['#FFFFFF', '#FEF08A', '#BAE6FD', '#FDE047', '#E0F2FE'];
    const starsCount = 140;
    // Concentrate stars in upper 48% of the viewport (the sky above the terrace wall)
    starsRef.current = Array.from({ length: starsCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.46),
      size: Math.random() * 1.8 + 0.6,
      baseAlpha: Math.random() * 0.6 + 0.25,
      twinkleSpeed: Math.random() * 2 + 1.2,
      twinkleOffset: Math.random() * Math.PI * 2,
      color: starColors[Math.floor(Math.random() * starColors.length)]
    }));

    // Floating lanterns
    const lanternCount = weatherMode === 'lanterns' ? 24 : 8;
    lanternsRef.current = Array.from({ length: lanternCount }, () => ({
      x: Math.random() * width,
      y: height * 0.15 + Math.random() * (height * 0.35),
      vx: (Math.random() - 0.2) * 0.3,
      vy: -0.2 - Math.random() * 0.3,
      size: Math.random() * 6 + 4,
      alpha: Math.random() * 0.6 + 0.4,
      flicker: Math.random() * 10
    }));
  }, [width, height, weatherMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();
    let nextShootingStarTime = performance.now() + 6000 + Math.random() * 8000;
    let nextDistantBurstTime = performance.now() + 2000;

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // --- 1. Gentle Glowing Festive Moon ---
      const moonX = width * 0.42;
      const moonY = height * 0.14;
      const moonRadius = Math.min(26, width * 0.024);

      // Multi-layered soft lunar halo
      const outerHalo = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.8, moonX, moonY, moonRadius * 6.5);
      outerHalo.addColorStop(0, weatherMode === 'mist' ? 'rgba(254, 240, 138, 0.22)' : 'rgba(254, 240, 138, 0.16)');
      outerHalo.addColorStop(0.4, 'rgba(251, 191, 36, 0.07)');
      outerHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerHalo;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius * 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Inner crisp lunar disc with warm golden glow
      const innerGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 1.5);
      innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      innerGlow.addColorStop(0.7, 'rgba(254, 240, 138, 0.9)');
      innerGlow.addColorStop(1, 'rgba(245, 158, 11, 0.4)');
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Gentle lunar crescent shadow shading for realistic depth
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.beginPath();
      ctx.arc(moonX + moonRadius * 0.45, moonY - moonRadius * 0.2, moonRadius * 0.85, 0, Math.PI * 2);
      ctx.fill();

      // --- 2. Twinkling Stars in Night Sky ---
      ctx.save();
      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(now * 0.002 * star.twinkleSpeed + star.twinkleOffset);
        // Alpha oscillates smoothly
        const currentAlpha = Math.max(0.1, Math.min(1.0, star.baseAlpha + twinkle * 0.35));

        ctx.fillStyle = star.color;
        ctx.globalAlpha = weatherMode === 'mist' ? currentAlpha * 0.6 : currentAlpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Cross flare on bright stars
        if (star.size > 2.0 && twinkle > 0.6) {
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - star.size * 2, star.y);
          ctx.lineTo(star.x + star.size * 2, star.y);
          ctx.moveTo(star.x, star.y - star.size * 2);
          ctx.lineTo(star.x, star.y + star.size * 2);
          ctx.stroke();
        }
      });
      ctx.restore();

      // --- 3. Occasional Shooting Star ---
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
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.alpha -= 0.025;

        if (ss.alpha <= 0 || ss.x > width || ss.y > height * 0.45) {
          ss.active = false;
        } else {
          ctx.save();
          ctx.strokeStyle = `rgba(254, 240, 138, ${ss.alpha})`;
          ctx.lineWidth = 1.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(ss.x - Math.cos(ss.angle) * ss.length, ss.y - Math.sin(ss.angle) * ss.length);
          ctx.stroke();
          ctx.restore();
        }
      }

      // --- 4. Floating Sky Lanterns (Akash Kandil) ---
      lanternsRef.current.forEach((l) => {
        l.x += l.vx;
        l.y += l.vy;
        l.flicker += 0.05;

        // Reset if ascends off screen
        if (l.y < -30) {
          l.y = height * 0.42;
          l.x = Math.random() * width;
        }

        const flickerAlpha = l.alpha * (0.85 + Math.sin(l.flicker) * 0.15);

        ctx.save();
        // Warm candle flame inside lantern
        const lanternGlow = ctx.createRadialGradient(l.x, l.y, 1, l.x, l.y, l.size * 2.5);
        lanternGlow.addColorStop(0, 'rgba(255, 237, 213, 0.95)');
        lanternGlow.addColorStop(0.4, 'rgba(249, 115, 22, 0.7)');
        lanternGlow.addColorStop(1, 'rgba(249, 115, 22, 0)');
        ctx.fillStyle = lanternGlow;
        ctx.beginPath();
        ctx.arc(l.x, l.y, l.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Lantern paper silhouette
        ctx.fillStyle = `rgba(254, 215, 170, ${flickerAlpha})`;
        ctx.beginPath();
        ctx.roundRect(l.x - l.size * 0.6, l.y - l.size * 0.8, l.size * 1.2, l.size * 1.6, 2);
        ctx.fill();

        ctx.restore();
      });

      // --- 5. Distant Horizon Fireworks ---
      if (weatherMode === 'distant_fireworks' && now > nextDistantBurstTime) {
        nextDistantBurstTime = now + 1400 + Math.random() * 1800;
        const burstColors = ['#F59E0B', '#EF4444', '#10B981', '#38BDF8', '#EC4899', '#A855F7'];
        const chosenColor = burstColors[Math.floor(Math.random() * burstColors.length)];
        const burstX = width * 0.08 + Math.random() * (width * 0.84);
        const burstY = height * 0.22 + Math.random() * (height * 0.16);

        const newParticles = Array.from({ length: 30 }, () => {
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

        distantBurstsRef.current.push({
          x: burstX,
          y: burstY,
          particles: newParticles,
          active: true
        });
      }

      // Update and draw distant bursts
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let b = distantBurstsRef.current.length - 1; b >= 0; b--) {
        const burst = distantBurstsRef.current[b];
        let hasAlive = false;

        burst.particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.04; // Gentle gravity
          p.alpha -= 0.02;

          if (p.alpha > 0) {
            hasAlive = true;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha * 0.7;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        if (!hasAlive) {
          distantBurstsRef.current.splice(b, 1);
        }
      }
      ctx.restore();

      // --- 6. Soft Autumn Mist / Haze Filter ---
      if (weatherMode === 'mist') {
        const mistGrad = ctx.createLinearGradient(0, height * 0.1, 0, height * 0.48);
        mistGrad.addColorStop(0, 'rgba(254, 240, 138, 0.02)');
        mistGrad.addColorStop(0.6, 'rgba(180, 83, 9, 0.06)');
        mistGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
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
};
