/**
 * Self-contained in-code vector SVG backdrops and Data URIs for:
 * 1. Starlit Courtyard (दीप आँगन) - Traditional illuminated courtyard with tree lanterns, glowing diyas, and rangoli
 * 2. Celebration Ground (उत्सव मैदान) - Vibrant open community festival grounds with fairy lights and arches
 * 3. Rooftop Terrace (शांत छत) - Serene rooftop terrace with stone balustrade, clay diyas and city skyline view
 *
 * Guarantees fallback rendering even offline or on static hosts with crisp starlit visuals.
 */

export const PROCEDURAL_COURTYARD_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
  <defs>
    <!-- Deep night sky gradient -->
    <linearGradient id="nightSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="40%" stop-color="#0B132B"/>
      <stop offset="65%" stop-color="#1C2541"/>
      <stop offset="100%" stop-color="#1E1B4B"/>
    </linearGradient>

    <!-- Courtyard Stone Floor Gradient -->
    <linearGradient id="stoneFloor" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#27272A"/>
      <stop offset="40%" stop-color="#3F3F46"/>
      <stop offset="100%" stop-color="#18181B"/>
    </linearGradient>

    <!-- Warm Terrace Lantern / Diya Glow -->
    <radialGradient id="diyaGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FEF08A" stop-opacity="0.9"/>
      <stop offset="35%" stop-color="#F59E0B" stop-opacity="0.6"/>
      <stop offset="70%" stop-color="#EF4444" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#B45309" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Deep Starlit Night Sky -->
  <rect x="0" y="0" width="1920" height="1080" fill="url(#nightSky)"/>

  <!-- Distant Twinkling Stars -->
  <g fill="#FFF" opacity="0.72">
    <circle cx="150" cy="120" r="1.5"/><circle cx="280" cy="80" r="1"/><circle cx="420" cy="190" r="2"/>
    <circle cx="580" cy="90" r="1"/><circle cx="710" cy="160" r="1.8"/><circle cx="890" cy="70" r="1.2"/>
    <circle cx="1050" cy="140" r="2"/><circle cx="1230" cy="90" r="1.4"/><circle cx="1400" cy="180" r="1.5"/>
    <circle cx="1600" cy="100" r="1.8"/><circle cx="1780" cy="150" r="1.2"/><circle cx="1160" cy="210" r="1.6"/>
  </g>

  <!-- Distant Silhouetted Tree Foliage with Hanging Lanterns -->
  <path d="M0 0 L0 380 Q180 320 320 260 Q450 220 620 180 Q800 120 950 0 Z" fill="#06121E" opacity="0.95"/>
  <path d="M0 0 L0 260 Q220 220 450 140 Q680 80 850 0 Z" fill="#0A2239" opacity="0.8"/>

  <!-- Glowing Hanging Lanterns from the tree branches -->
  <g>
    <line x1="280" y1="120" x2="280" y2="290" stroke="#FDE047" stroke-width="1.5" opacity="0.6"/>
    <circle cx="280" cy="320" r="45" fill="url(#diyaGlow)"/>
    <rect x="264" y="290" width="32" height="52" rx="6" fill="#F59E0B" stroke="#FEF08A" stroke-width="2"/>
    <rect x="270" y="298" width="20" height="36" rx="4" fill="#FEF08A" opacity="0.9"/>

    <line x1="400" y1="80" x2="400" y2="240" stroke="#FDE047" stroke-width="1.5" opacity="0.6"/>
    <circle cx="400" cy="270" r="45" fill="url(#diyaGlow)"/>
    <rect x="384" y="240" width="32" height="52" rx="6" fill="#F59E0B" stroke="#FEF08A" stroke-width="2"/>
    <rect x="390" y="248" width="20" height="36" rx="4" fill="#FEF08A" opacity="0.9"/>
  </g>

  <!-- Traditional Courtyard Villa Pillars on the Right -->
  <path d="M1560 0 L1560 620 L1920 620 L1920 0 Z" fill="#1C1917"/>
  <polygon points="1520,180 1920,80 1920,200 1520,260" fill="#78350F"/>
  <polygon points="1520,240 1920,140 1920,160 1520,250" fill="#F59E0B" opacity="0.8"/>
  <rect x="1720" y="240" width="80" height="380" rx="8" fill="#FDE68A" opacity="0.9"/>
  <rect x="1710" y="220" width="100" height="30" rx="4" fill="#F59E0B"/>
  <rect x="1710" y="590" width="100" height="30" rx="4" fill="#F59E0B"/>

  <g fill="#FDE047">
    <circle cx="1700" cy="260" r="4"/><circle cx="1700" cy="300" r="4"/><circle cx="1700" cy="340" r="4"/>
    <circle cx="1700" cy="380" r="4"/><circle cx="1700" cy="420" r="4"/><circle cx="1700" cy="460" r="4"/>
    <circle cx="1700" cy="500" r="4"/><circle cx="1700" cy="540" r="4"/>
  </g>

  <rect x="0" y="530" width="1920" height="90" fill="#292524" stroke="#44403C" stroke-width="2"/>
  <path d="M0 550 Q160 570 320 550 Q480 570 640 550 Q800 570 960 550 Q1120 570 1280 550 Q1440 570 1600 550 L1920 550" fill="none" stroke="#FDE047" stroke-width="2" opacity="0.8"/>
  <g fill="#FEF08A">
    <circle cx="80" cy="560" r="4"/><circle cx="160" cy="565" r="4"/><circle cx="240" cy="560" r="4"/>
    <circle cx="400" cy="560" r="4"/><circle cx="480" cy="565" r="4"/><circle cx="560" cy="560" r="4"/>
    <circle cx="720" cy="560" r="4"/><circle cx="800" cy="565" r="4"/><circle cx="880" cy="560" r="4"/>
    <circle cx="1040" cy="560" r="4"/><circle cx="1120" cy="565" r="4"/><circle cx="1200" cy="560" r="4"/>
    <circle cx="1360" cy="560" r="4"/><circle cx="1440" cy="565" r="4"/><circle cx="1520" cy="560" r="4"/>
  </g>

  <!-- Courtyard Stone Tile Ground -->
  <polygon points="0,620 1920,620 1920,1080 0,1080" fill="url(#stoneFloor)"/>

  <g stroke="#52525B" stroke-width="1.2" opacity="0.4">
    <line x1="960" y1="620" x2="300" y2="1080"/>
    <line x1="960" y1="620" x2="650" y2="1080"/>
    <line x1="960" y1="620" x2="960" y2="1080"/>
    <line x1="960" y1="620" x2="1270" y2="1080"/>
    <line x1="960" y1="620" x2="1620" y2="1080"/>
    <line x1="0" y1="710" x2="1920" y2="710"/>
    <line x1="0" y1="810" x2="1920" y2="810"/>
    <line x1="0" y1="930" x2="1920" y2="930"/>
  </g>

  <!-- Flower Rangoli -->
  <g transform="translate(1700, 850)">
    <circle cx="0" cy="0" r="140" fill="#991B1B" opacity="0.75"/>
    <circle cx="0" cy="0" r="105" fill="#D97706" opacity="0.8"/>
    <circle cx="0" cy="0" r="70" fill="#FBBF24" opacity="0.85"/>
    <circle cx="0" cy="0" r="35" fill="#FFF" opacity="0.9"/>
  </g>

  <!-- Glowing Clay Diyas -->
  <g transform="translate(60, 680)">
    <circle cx="0" cy="0" r="30" fill="url(#diyaGlow)"/>
    <path d="M-14 4 Q0 16 14 4 Q0 2 -14 4 Z" fill="#92400E"/>
    <ellipse cx="0" cy="-2" rx="3.5" ry="7" fill="#FDE047"/>
    <ellipse cx="0" cy="-2" rx="1.5" ry="4" fill="#EF4444"/>
  </g>
  <g transform="translate(420, 650)">
    <circle cx="0" cy="0" r="30" fill="url(#diyaGlow)"/>
    <path d="M-14 4 Q0 16 14 4 Q0 2 -14 4 Z" fill="#92400E"/>
    <ellipse cx="0" cy="-2" rx="3.5" ry="7" fill="#FDE047"/>
    <ellipse cx="0" cy="-2" rx="1.5" ry="4" fill="#EF4444"/>
  </g>
  <g transform="translate(780, 640)">
    <circle cx="0" cy="0" r="32" fill="url(#diyaGlow)"/>
    <path d="M-14 4 Q0 16 14 4 Q0 2 -14 4 Z" fill="#92400E"/>
    <ellipse cx="0" cy="-2" rx="3.5" ry="7" fill="#FDE047"/>
    <ellipse cx="0" cy="-2" rx="1.5" ry="4" fill="#EF4444"/>
  </g>
  <g transform="translate(1080, 640)">
    <circle cx="0" cy="0" r="32" fill="url(#diyaGlow)"/>
    <path d="M-14 4 Q0 16 14 4 Q0 2 -14 4 Z" fill="#92400E"/>
    <ellipse cx="0" cy="-2" rx="3.5" ry="7" fill="#FDE047"/>
    <ellipse cx="0" cy="-2" rx="1.5" ry="4" fill="#EF4444"/>
  </g>
  <g transform="translate(1380, 650)">
    <circle cx="0" cy="0" r="30" fill="url(#diyaGlow)"/>
    <path d="M-14 4 Q0 16 14 4 Q0 2 -14 4 Z" fill="#92400E"/>
    <ellipse cx="0" cy="-2" rx="3.5" ry="7" fill="#FDE047"/>
    <ellipse cx="0" cy="-2" rx="1.5" ry="4" fill="#EF4444"/>
  </g>
  <g transform="translate(1620, 800)">
    <circle cx="0" cy="0" r="45" fill="url(#diyaGlow)"/>
    <path d="M-18 6 Q0 22 18 6 Q0 3 -18 6 Z" fill="#92400E"/>
    <ellipse cx="0" cy="-4" rx="4.5" ry="9" fill="#FDE047"/>
    <ellipse cx="0" cy="-4" rx="2" ry="5" fill="#EF4444"/>
  </g>
</svg>
`)}`;

export const PROCEDURAL_PLAYGROUND_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="pgSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#090A1A"/>
      <stop offset="50%" stop-color="#141838"/>
      <stop offset="100%" stop-color="#2D1B4E"/>
    </linearGradient>
    <linearGradient id="pgFloor" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E1E24"/>
      <stop offset="50%" stop-color="#2A2A32"/>
      <stop offset="100%" stop-color="#121215"/>
    </linearGradient>
  </defs>

  <rect x="0" y="0" width="1920" height="1080" fill="url(#pgSky)"/>

  <path d="M0 320 Q960 120 1920 320" stroke="#FDE047" stroke-width="3" fill="none" opacity="0.8"/>
  <path d="M0 420 Q960 220 1920 420" stroke="#F59E0B" stroke-width="2" fill="none" opacity="0.6"/>

  <polygon points="120,620 180,480 240,620" fill="#111827"/>
  <polygon points="320,620 420,440 500,620" fill="#1F2937"/>
  <polygon points="1420,620 1520,460 1620,620" fill="#1F2937"/>
  <polygon points="1680,620 1760,500 1840,620" fill="#111827"/>

  <rect x="0" y="620" width="1920" height="460" fill="url(#pgFloor)"/>
</svg>
`)}`;

export const PROCEDURAL_TERRACE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="terraceSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#030712"/>
      <stop offset="45%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E1B4B"/>
    </linearGradient>
    <linearGradient id="terraceFloor" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#262626"/>
      <stop offset="60%" stop-color="#404040"/>
      <stop offset="100%" stop-color="#171717"/>
    </linearGradient>
  </defs>

  <rect x="0" y="0" width="1920" height="1080" fill="url(#terraceSky)"/>

  <g fill="#171717">
    <rect x="180" y="440" width="80" height="180"/>
    <rect x="300" y="400" width="110" height="220"/>
    <rect x="460" y="460" width="90" height="160"/>
    <rect x="620" y="380" width="140" height="240"/>
    <rect x="800" y="430" width="100" height="190"/>
    <rect x="1100" y="420" width="120" height="200"/>
    <rect x="1300" y="390" width="100" height="230"/>
    <rect x="1460" y="450" width="130" height="170"/>
    <rect x="1640" y="410" width="110" height="210"/>
  </g>

  <rect x="0" y="580" width="1920" height="40" fill="#52525B" stroke="#71717A" stroke-width="1.5"/>
  <polygon points="0,620 1920,620 1920,1080 0,1080" fill="url(#terraceFloor)"/>
</svg>
`)}`;

export const PROCEDURAL_BACKGROUND_MAP: Record<string, string> = {
  courtyard: PROCEDURAL_COURTYARD_SVG,
  playground: PROCEDURAL_PLAYGROUND_SVG,
  terrace: PROCEDURAL_TERRACE_SVG
};
