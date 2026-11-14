import React from 'react';

interface LanternConfig {
  id: string;
  leftPercent: number;
  cordLength: number;
  width: number;
  height: number;
  swayDuration: number;
  swayAngle: number;
  delay: number;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  tasselLength: number;
}

const LANTERNS: LanternConfig[] = [
  {
    id: 'lantern_1',
    leftPercent: 6,
    cordLength: 32,
    width: 44,
    height: 52,
    swayDuration: 4.8,
    swayAngle: 4.5,
    delay: 0,
    primaryColor: '#F59E0B',
    secondaryColor: '#EF4444',
    glowColor: 'rgba(245, 158, 11, 0.38)',
    tasselLength: 48
  },
  {
    id: 'lantern_2',
    leftPercent: 22,
    cordLength: 48,
    width: 48,
    height: 58,
    swayDuration: 5.6,
    swayAngle: -5.2,
    delay: 0.9,
    primaryColor: '#EC4899',
    secondaryColor: '#F59E0B',
    glowColor: 'rgba(236, 72, 153, 0.35)',
    tasselLength: 58
  },
  {
    id: 'lantern_3',
    leftPercent: 46,
    cordLength: 26,
    width: 42,
    height: 50,
    swayDuration: 4.2,
    swayAngle: 3.8,
    delay: 1.6,
    primaryColor: '#38BDF8',
    secondaryColor: '#FDE047',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    tasselLength: 44
  },
  {
    id: 'lantern_4',
    leftPercent: 74,
    cordLength: 52,
    width: 50,
    height: 60,
    swayDuration: 5.2,
    swayAngle: -4.8,
    delay: 0.5,
    primaryColor: '#10B981',
    secondaryColor: '#F59E0B',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    tasselLength: 60
  },
  {
    id: 'lantern_5',
    leftPercent: 89,
    cordLength: 36,
    width: 44,
    height: 54,
    swayDuration: 4.5,
    swayAngle: 5.0,
    delay: 1.2,
    primaryColor: '#8B5CF6',
    secondaryColor: '#F43F5E',
    glowColor: 'rgba(139, 92, 246, 0.38)',
    tasselLength: 50
  }
];

export const HangingLanterns: React.FC = React.memo(() => {
  return (
    <div className="absolute top-0 left-0 right-0 h-52 pointer-events-none z-25 overflow-x-clip select-none">
      {/* Hanging Golden Wire across the top */}
      <svg className="absolute top-0 left-0 w-full h-8 overflow-hidden" preserveAspectRatio="none">
        <path
          d="M 0,2 Q 360,14 720,2 T 1440,2 T 2160,14"
          fill="none"
          stroke="rgba(245, 158, 11, 0.4)"
          strokeWidth="1.2"
        />
        {Array.from({ length: 18 }).map((_, i) => {
          const x = (i / 17) * 100;
          return (
            <circle
              key={i}
              cx={`${x}%`}
              cy={6 + Math.sin(i * 0.8) * 3}
              r="2"
              fill={i % 2 === 0 ? '#FDE047' : '#FB923C'}
              className="animate-bulb-twinkle"
              style={{ animationDelay: `${(i % 5) * 0.45}s` }}
            />
          );
        })}
      </svg>

      {/* GPU-Composited CSS Hanging Lanterns (zero JS per-frame overhead) */}
      {LANTERNS.map((lantern) => (
        <div
          key={lantern.id}
          className="absolute top-0"
          style={{ left: `${lantern.leftPercent}%` }}
        >
          {/* Hanging Cord */}
          <div
            className="w-0.5 bg-gradient-to-b from-amber-600/70 to-amber-400 mx-auto"
            style={{ height: `${lantern.cordLength}px` }}
          />

          {/* Swaying Lantern Body */}
          <div
            className="relative flex flex-col items-center animate-lantern-sway"
            style={
              {
                '--sway-angle': `${lantern.swayAngle}deg`,
                '--sway-shift': lantern.swayAngle > 0 ? '2.5px' : '-2.5px',
                '--sway-duration': `${lantern.swayDuration}s`,
                '--sway-delay': `${lantern.delay}s`
              } as React.CSSProperties
            }
          >
            {/* Soft radial glow (zero filter: blur rasterization overhead) */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                width: `${lantern.width * 2}px`,
                height: `${lantern.height * 2}px`,
                background: `radial-gradient(circle, ${lantern.glowColor} 0%, transparent 70%)`
              }}
            />

            {/* Traditional Diwali Paper Akash Kandil SVG */}
            <svg
              width={lantern.width}
              height={lantern.height}
              viewBox="0 0 60 70"
              className="relative z-10"
            >
              <path d="M 30,0 L 30,6" stroke="#D97706" strokeWidth="2" />
              <circle cx="30" cy="6" r="3" fill="#F59E0B" />

              <polygon
                points="30,8 10,22 50,22"
                fill={lantern.primaryColor}
                stroke="#FDE047"
                strokeWidth="1.5"
              />

              <polygon
                points="10,22 4,38 10,54 50,54 56,38 50,22"
                fill={`url(#lantern-grad-${lantern.id})`}
                stroke="#FDE047"
                strokeWidth="1.5"
              />

              <circle cx="30" cy="38" r="8" fill="#FFFBEB" opacity="0.95" />
              <polygon
                points="30,32 33,36 38,38 33,40 30,44 27,40 22,38 27,36"
                fill={lantern.secondaryColor}
              />

              <circle cx="16" cy="38" r="2.5" fill="#FDE047" />
              <circle cx="44" cy="38" r="2.5" fill="#FDE047" />

              <polygon
                points="10,54 30,68 50,54"
                fill={lantern.primaryColor}
                stroke="#FDE047"
                strokeWidth="1.5"
              />

              <defs>
                <linearGradient id={`lantern-grad-${lantern.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={lantern.primaryColor} />
                  <stop offset="50%" stopColor={lantern.secondaryColor} />
                  <stop offset="100%" stopColor={lantern.primaryColor} />
                </linearGradient>
              </defs>
            </svg>

            {/* Tassel Strip Group swaying via pure CSS transform */}
            <div
              className="flex items-start justify-center gap-1 -mt-1 relative z-0 animate-tassel-sway"
              style={
                {
                  '--sway-angle': `${lantern.swayAngle}deg`,
                  '--tassel-duration': `${(lantern.swayDuration * 0.9).toFixed(2)}s`,
                  '--sway-delay': `${(lantern.delay + 0.2).toFixed(2)}s`
                } as React.CSSProperties
              }
            >
              {[-1.5, -0.8, 0, 0.8, 1.5].map((offset, idx) => {
                const stripHeight = lantern.tasselLength - Math.abs(offset) * 8;
                const isGold = idx % 2 === 0;
                return (
                  <div
                    key={idx}
                    className="w-1 rounded-b-sm"
                    style={{
                      height: `${stripHeight}px`,
                      backgroundColor: isGold ? '#FDE047' : lantern.primaryColor
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
