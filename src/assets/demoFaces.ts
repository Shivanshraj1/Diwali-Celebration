import React from 'react';

/**
 * High-fidelity, self-contained in-code vector SVG faces and Data URIs
 * for all demo characters (Aarav, Priya, Kabir, Ananya).
 * This ensures that on GitHub, GitHub Pages, or any offline/production build,
 * the demo faces are 100% accessible directly in the code itself with ZERO external dependencies!
 */

// 1. Aarav (Celebration Host - Golden Silk Kurta & Royal Pagdi Turban with Kalgi)
export const AARAV_SVG_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <radialGradient id="aaravBg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#78350F"/>
      <stop offset="70%" stop-color="#1C1917"/>
      <stop offset="100%" stop-color="#0C0A09"/>
    </radialGradient>
    <linearGradient id="aaravSkin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="50%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
    <linearGradient id="aaravPagdi" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
    <linearGradient id="aaravKurta" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#78350F"/>
    </linearGradient>
  </defs>
  <!-- Background circle with warm festive glow -->
  <circle cx="60" cy="60" r="58" fill="url(#aaravBg)"/>
  <circle cx="60" cy="60" r="57" fill="none" stroke="#F59E0B" stroke-width="2" stroke-opacity="0.6"/>

  <!-- Golden Silk Kurta & Nehru Collar -->
  <path d="M25 118 Q35 90 60 90 Q85 90 95 118 Z" fill="url(#aaravKurta)"/>
  <!-- Gold placket & buttons -->
  <line x1="60" y1="90" x2="60" y2="118" stroke="#FDE047" stroke-width="2.5"/>
  <circle cx="60" cy="98" r="1.5" fill="#FFF"/>
  <circle cx="60" cy="106" r="1.5" fill="#FFF"/>

  <!-- Neck -->
  <rect x="52" y="72" width="16" height="22" rx="4" fill="url(#aaravSkin)"/>

  <!-- Face -->
  <ellipse cx="60" cy="60" rx="22" ry="26" fill="url(#aaravSkin)"/>

  <!-- Ears with small gold studs -->
  <ellipse cx="37" cy="60" rx="3.5" ry="6" fill="#D97706"/>
  <circle cx="37" cy="63" r="1.2" fill="#FDE047"/>
  <ellipse cx="83" cy="60" rx="3.5" ry="6" fill="#D97706"/>
  <circle cx="83" cy="63" r="1.2" fill="#FDE047"/>

  <!-- Eyes & Eyebrows -->
  <path d="M44 50 Q51 46 56 49" stroke="#1F2937" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M64 49 Q69 46 76 50" stroke="#1F2937" stroke-width="2" stroke-linecap="round" fill="none"/>
  <!-- Eye whites & pupils -->
  <ellipse cx="50" cy="54" rx="4.5" ry="3" fill="#FFF"/>
  <circle cx="51" cy="54" r="2.2" fill="#1C1917"/>
  <circle cx="51.8" cy="53.2" r="0.8" fill="#FFF"/>
  <ellipse cx="70" cy="54" rx="4.5" ry="3" fill="#FFF"/>
  <circle cx="71" cy="54" r="2.2" fill="#1C1917"/>
  <circle cx="71.8" cy="53.2" r="0.8" fill="#FFF"/>

  <!-- Golden Tilak on Forehead -->
  <path d="M59 40 Q60 36 61 40 L60.8 47 L59.2 47 Z" fill="#EF4444"/>
  <circle cx="60" cy="48" r="1.2" fill="#FDE047"/>

  <!-- Nose -->
  <path d="M60 52 L60 64 Q63 65 60 66" stroke="#92400E" stroke-width="1.8" stroke-linecap="round" fill="none"/>

  <!-- Warm Festive Smile -->
  <path d="M51 70 Q60 77 69 70" stroke="#78350F" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M52 70 Q60 76 68 70" fill="#FFF" opacity="0.9"/>

  <!-- Royal Golden Pagdi (Turban) -->
  <path d="M36 44 Q42 22 60 20 Q78 22 84 44 Q70 34 60 34 Q50 34 36 44 Z" fill="url(#aaravPagdi)"/>
  <path d="M38 42 C48 30 72 30 82 42" stroke="#FEF08A" stroke-width="2" fill="none"/>
  <path d="M40 36 C50 26 70 26 80 36" stroke="#B45309" stroke-width="1.5" fill="none"/>
  <!-- Turban Kalgi (Jewel Feathers) -->
  <ellipse cx="60" cy="22" rx="3.5" ry="6" fill="#EF4444"/>
  <circle cx="60" cy="22" r="2" fill="#FDE047"/>
  <path d="M60 16 Q63 8 60 4 Q57 8 60 16" fill="#FDE047"/>
</svg>
`)}`;

// 2. Priya (Diya Lighting Artist - Crimson Zari Attire, Gold Jhumkas & Bindi)
export const PRIYA_SVG_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <radialGradient id="priyaBg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#881337"/>
      <stop offset="70%" stop-color="#1C1917"/>
      <stop offset="100%" stop-color="#0C0A09"/>
    </radialGradient>
    <linearGradient id="priyaSkin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="priyaSaree" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F43F5E"/>
      <stop offset="50%" stop-color="#BE123C"/>
      <stop offset="100%" stop-color="#881337"/>
    </linearGradient>
  </defs>
  <!-- Background circle with warm festive glow -->
  <circle cx="60" cy="60" r="58" fill="url(#priyaBg)"/>
  <circle cx="60" cy="60" r="57" fill="none" stroke="#F43F5E" stroke-width="2" stroke-opacity="0.6"/>

  <!-- Crimson Saree / Choli with Golden Zari Border -->
  <path d="M22 118 Q36 90 60 90 Q84 90 98 118 Z" fill="url(#priyaSaree)"/>
  <!-- Diagonal Gold Zari Dupatta Drape -->
  <path d="M30 118 L70 90 L80 90 L40 118 Z" fill="#FDE047" opacity="0.85"/>
  <circle cx="60" cy="98" r="1.5" fill="#FEF08A"/>

  <!-- Neck & Gold Necklace (Haar) -->
  <rect x="53" y="72" width="14" height="20" rx="4" fill="url(#priyaSkin)"/>
  <path d="M50 84 Q60 92 70 84" stroke="#FDE047" stroke-width="2.5" fill="none"/>
  <circle cx="60" cy="89" r="2" fill="#EF4444"/>

  <!-- Hair (Silky Black Bun & Tresses) -->
  <ellipse cx="60" cy="46" rx="27" ry="28" fill="#18181B"/>
  <circle cx="60" cy="22" r="12" fill="#18181B"/>
  <!-- Gajra jasmine flower ring on bun -->
  <circle cx="48" cy="22" r="2.5" fill="#FEF08A"/>
  <circle cx="54" cy="18" r="2.5" fill="#FFFFFF"/>
  <circle cx="60" cy="16" r="2.5" fill="#FEF08A"/>
  <circle cx="66" cy="18" r="2.5" fill="#FFFFFF"/>
  <circle cx="72" cy="22" r="2.5" fill="#FEF08A"/>

  <!-- Face -->
  <ellipse cx="60" cy="61" rx="21" ry="25" fill="url(#priyaSkin)"/>

  <!-- Gold Jhumka Earrings -->
  <circle cx="36" cy="65" r="2" fill="#FDE047"/>
  <path d="M33 69 L39 69 L36 75 Z" fill="#F59E0B"/>
  <circle cx="36" cy="76" r="1" fill="#FEF08A"/>
  <circle cx="84" cy="65" r="2" fill="#FDE047"/>
  <path d="M81 69 L87 69 L84 75 Z" fill="#F59E0B"/>
  <circle cx="84" cy="76" r="1" fill="#FEF08A"/>

  <!-- Eyes & Kajal Eyebrows -->
  <path d="M44 52 Q50 48 56 51" stroke="#09090B" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <path d="M64 51 Q70 48 76 52" stroke="#09090B" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <!-- Eyes with almond Indian shape & kajal -->
  <ellipse cx="50" cy="55" rx="5" ry="3.2" fill="#FFF"/>
  <circle cx="51" cy="55" r="2.2" fill="#27272A"/>
  <circle cx="52" cy="54.2" r="0.8" fill="#FFF"/>
  <path d="M44 55 Q50 59 56 55" stroke="#18181B" stroke-width="1.2" fill="none"/>
  <ellipse cx="70" cy="55" rx="5" ry="3.2" fill="#FFF"/>
  <circle cx="71" cy="55" r="2.2" fill="#27272A"/>
  <circle cx="72" cy="54.2" r="0.8" fill="#FFF"/>
  <path d="M64 55 Q70 59 76 55" stroke="#18181B" stroke-width="1.2" fill="none"/>

  <!-- Decorative Red Bindi & Maang Tikka -->
  <circle cx="60" cy="46" r="2.2" fill="#E11D48"/>
  <circle cx="60" cy="42" r="1" fill="#FDE047"/>
  <line x1="60" y1="28" x2="60" y2="40" stroke="#FDE047" stroke-width="1.2"/>
  <circle cx="60" cy="38" r="1.8" fill="#F59E0B"/>

  <!-- Nose & Small Gold Nath (Nose Ring) -->
  <path d="M60 54 L60 64 Q62 65 60 66" stroke="#B45309" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <circle cx="64" cy="65" r="1.2" fill="#FDE047"/>

  <!-- Rose Lip Smile -->
  <path d="M52 71 Q60 78 68 71" stroke="#BE123C" stroke-width="2" stroke-linecap="round" fill="#E11D48"/>
</svg>
`)}`;

// 3. Kabir (Pyrotechnic Enthusiast - Royal Navy Sherwani & Joyful Glow)
export const KABIR_SVG_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <radialGradient id="kabirBg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#1E3A8A"/>
      <stop offset="70%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="kabirSkin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="50%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#92400E"/>
    </linearGradient>
    <linearGradient id="kabirSherwani" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2563EB"/>
      <stop offset="60%" stop-color="#1D4ED8"/>
      <stop offset="100%" stop-color="#1E3A8A"/>
    </linearGradient>
  </defs>
  <!-- Background circle with warm festive glow -->
  <circle cx="60" cy="60" r="58" fill="url(#kabirBg)"/>
  <circle cx="60" cy="60" r="57" fill="none" stroke="#3B82F6" stroke-width="2" stroke-opacity="0.6"/>

  <!-- Royal Navy Sherwani & Gold Collar -->
  <path d="M24 118 Q36 90 60 90 Q84 90 96 118 Z" fill="url(#kabirSherwani)"/>
  <!-- Gold Mandarin Collar -->
  <path d="M50 90 L50 84 Q60 81 70 84 L70 90 Z" fill="#F59E0B"/>
  <line x1="60" y1="84" x2="60" y2="118" stroke="#FDE047" stroke-width="2.5"/>
  <circle cx="60" cy="94" r="1.5" fill="#FFF"/>
  <circle cx="60" cy="104" r="1.5" fill="#FFF"/>

  <!-- Neck -->
  <rect x="52" y="70" width="16" height="18" rx="4" fill="url(#kabirSkin)"/>

  <!-- Modern Hair -->
  <path d="M36 46 Q40 24 60 24 Q80 24 84 46 Q72 36 60 36 Q48 36 36 46 Z" fill="#18181B"/>
  <path d="M38 38 Q48 22 62 25 Q78 28 82 42" stroke="#27272A" stroke-width="3" fill="none"/>

  <!-- Face -->
  <ellipse cx="60" cy="58" rx="22" ry="25" fill="url(#kabirSkin)"/>

  <!-- Ears with small studs -->
  <ellipse cx="37" cy="58" rx="3.5" ry="5.5" fill="#D97706"/>
  <ellipse cx="83" cy="58" rx="3.5" ry="5.5" fill="#D97706"/>
  <circle cx="83.5" cy="61" r="1.2" fill="#FDE047"/>

  <!-- Eyes & Sharp Eyebrows -->
  <path d="M43 47 Q50 43 57 46" stroke="#18181B" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <path d="M63 46 Q70 43 77 47" stroke="#18181B" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <ellipse cx="50" cy="52" rx="4.5" ry="3" fill="#FFF"/>
  <circle cx="51.5" cy="52" r="2.2" fill="#18181B"/>
  <circle cx="52.2" cy="51.2" r="0.8" fill="#FFF"/>
  <ellipse cx="70" cy="52" rx="4.5" ry="3" fill="#FFF"/>
  <circle cx="71.5" cy="52" r="2.2" fill="#18181B"/>
  <circle cx="72.2" cy="51.2" r="0.8" fill="#FFF"/>

  <!-- Tilak -->
  <line x1="60" y1="36" x2="60" y2="44" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="60" cy="46" r="1.2" fill="#EF4444"/>

  <!-- Nose -->
  <path d="M60 50 L60 62 Q63 63 60 64" stroke="#92400E" stroke-width="1.8" stroke-linecap="round" fill="none"/>

  <!-- Enthusiastic Smile -->
  <path d="M51 68 Q60 76 69 68" stroke="#78350F" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M52 68 Q60 75 68 68" fill="#FFF"/>
</svg>
`)}`;

// 4. Ananya (Sweets & Rangoli Curator - Emerald Green Attire, Gajra & Radiance)
export const ANANYA_SVG_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <radialGradient id="ananyaBg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#064E3B"/>
      <stop offset="70%" stop-color="#022C22"/>
      <stop offset="100%" stop-color="#0C0A09"/>
    </radialGradient>
    <linearGradient id="ananyaSkin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="ananyaLehenga" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="60%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
  </defs>
  <!-- Background circle with warm festive glow -->
  <circle cx="60" cy="60" r="58" fill="url(#ananyaBg)"/>
  <circle cx="60" cy="60" r="57" fill="none" stroke="#10B981" stroke-width="2" stroke-opacity="0.6"/>

  <!-- Emerald Green Lehenga Choli with Gold Embroidered Border -->
  <path d="M22 118 Q36 90 60 90 Q84 90 98 118 Z" fill="url(#ananyaLehenga)"/>
  <!-- Gold Hem Border & Zari Latkan -->
  <path d="M42 90 Q60 96 78 90" stroke="#FDE047" stroke-width="2" fill="none"/>
  <circle cx="60" cy="98" r="1.5" fill="#FEF08A"/>
  <circle cx="60" cy="106" r="1.5" fill="#FEF08A"/>

  <!-- Neck & Emerald Pendant Necklace -->
  <rect x="53" y="72" width="14" height="20" rx="4" fill="url(#ananyaSkin)"/>
  <path d="M50 82 Q60 90 70 82" stroke="#FDE047" stroke-width="2" fill="none"/>
  <polygon points="60,86 63,90 60,94 57,90" fill="#10B981"/>

  <!-- Elegant Traditional Hair with Gajra Flowers -->
  <ellipse cx="60" cy="46" rx="27" ry="28" fill="#18181B"/>
  <circle cx="60" cy="22" r="12" fill="#18181B"/>
  <!-- Pure white jasmine gajra buds -->
  <circle cx="48" cy="22" r="2.5" fill="#FFFFFF"/>
  <circle cx="53" cy="18" r="2.5" fill="#FEF08A"/>
  <circle cx="60" cy="16" r="2.5" fill="#FFFFFF"/>
  <circle cx="67" cy="18" r="2.5" fill="#FEF08A"/>
  <circle cx="72" cy="22" r="2.5" fill="#FFFFFF"/>

  <!-- Face -->
  <ellipse cx="60" cy="61" rx="21" ry="25" fill="url(#ananyaSkin)"/>

  <!-- Emerald Gold Jhumkas -->
  <circle cx="36" cy="64" r="2" fill="#FDE047"/>
  <circle cx="36" cy="70" r="3" fill="#059669"/>
  <circle cx="36" cy="74" r="1" fill="#FDE047"/>
  <circle cx="84" cy="64" r="2" fill="#FDE047"/>
  <circle cx="84" cy="70" r="3" fill="#059669"/>
  <circle cx="84" cy="74" r="1" fill="#FDE047"/>

  <!-- Eyes & Eyebrows -->
  <path d="M44 52 Q50 48 56 51" stroke="#09090B" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <path d="M64 51 Q70 48 76 52" stroke="#09090B" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <ellipse cx="50" cy="55" rx="5" ry="3.2" fill="#FFF"/>
  <circle cx="51" cy="55" r="2.2" fill="#27272A"/>
  <circle cx="52" cy="54.2" r="0.8" fill="#FFF"/>
  <path d="M44 55 Q50 59 56 55" stroke="#18181B" stroke-width="1.2" fill="none"/>
  <ellipse cx="70" cy="55" rx="5" ry="3.2" fill="#FFF"/>
  <circle cx="71" cy="55" r="2.2" fill="#27272A"/>
  <circle cx="72" cy="54.2" r="0.8" fill="#FFF"/>
  <path d="M64 55 Q70 59 76 55" stroke="#18181B" stroke-width="1.2" fill="none"/>

  <!-- Traditional Maroon Bindi & Delicate Pearl Dots -->
  <circle cx="60" cy="46" r="2" fill="#991B1B"/>
  <circle cx="60" cy="42" r="0.9" fill="#FFF"/>
  <circle cx="57" cy="46" r="0.7" fill="#FFF"/>
  <circle cx="63" cy="46" r="0.7" fill="#FFF"/>

  <!-- Nose & Small Sparkle Stud -->
  <path d="M60 54 L60 64 Q62 65 60 66" stroke="#B45309" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <circle cx="64" cy="65" r="1" fill="#FDE047"/>

  <!-- Sweet Cheerful Smile -->
  <path d="M52 71 Q60 78 68 71" stroke="#991B1B" stroke-width="2" stroke-linecap="round" fill="#DC2626"/>
</svg>
`)}`;

// 5. Meera (Royal Purple & Gold Silk Saree DP)
export const MEERA_SVG_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <radialGradient id="meeraBg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#581C87"/>
      <stop offset="70%" stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#09090B"/>
    </radialGradient>
    <linearGradient id="meeraSkin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="60%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="meeraSaree" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A855F7"/>
      <stop offset="60%" stop-color="#7E22CE"/>
      <stop offset="100%" stop-color="#581C87"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#meeraBg)"/>
  <circle cx="60" cy="60" r="57" fill="none" stroke="#C084FC" stroke-width="2" stroke-opacity="0.65"/>
  <path d="M22 118 Q36 90 60 90 Q84 90 98 118 Z" fill="url(#meeraSaree)"/>
  <path d="M28 118 L72 90 L82 90 L38 118 Z" fill="#FDE047" opacity="0.85"/>
  <rect x="53" y="72" width="14" height="20" rx="4" fill="url(#meeraSkin)"/>
  <path d="M49 84 Q60 92 71 84" stroke="#FDE047" stroke-width="2.2" fill="none"/>
  <ellipse cx="60" cy="48" rx="28" ry="29" fill="#18181B"/>
  <path d="M32 52 Q30 78 36 94 L42 92 Q38 72 40 52 Z" fill="#18181B"/>
  <path d="M88 52 Q90 78 84 94 L78 92 Q82 72 80 52 Z" fill="#18181B"/>
  <ellipse cx="60" cy="60" rx="21" ry="25" fill="url(#meeraSkin)"/>
  <circle cx="36" cy="65" r="2.2" fill="#FDE047"/>
  <circle cx="36" cy="71" r="3" fill="#A855F7"/>
  <circle cx="84" cy="65" r="2.2" fill="#FDE047"/>
  <circle cx="84" cy="71" r="3" fill="#A855F7"/>
  <path d="M44 51 Q50 47 56 50" stroke="#09090B" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <path d="M64 50 Q70 47 76 51" stroke="#09090B" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <ellipse cx="50" cy="54" rx="4.8" ry="3" fill="#FFF"/>
  <circle cx="51" cy="54" r="2.1" fill="#18181B"/>
  <ellipse cx="70" cy="54" rx="4.8" ry="3" fill="#FFF"/>
  <circle cx="71" cy="54" r="2.1" fill="#18181B"/>
  <circle cx="60" cy="45" r="2" fill="#E11D48"/>
  <path d="M60 53 L60 63 Q62 64 60 65" stroke="#B45309" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <path d="M52 70 Q60 77 68 70" stroke="#9D174D" stroke-width="2" stroke-linecap="round" fill="#E11D48"/>
</svg>
`)}`;

// 6. Rohan (Saffron Orange Festive Kurta DP)
export const ROHAN_SVG_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <radialGradient id="rohanBg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#9A3412"/>
      <stop offset="70%" stop-color="#1C1917"/>
      <stop offset="100%" stop-color="#09090B"/>
    </radialGradient>
    <linearGradient id="rohanSkin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="55%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#92400E"/>
    </linearGradient>
    <linearGradient id="rohanKurta" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FB923C"/>
      <stop offset="60%" stop-color="#EA580C"/>
      <stop offset="100%" stop-color="#9A3412"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#rohanBg)"/>
  <circle cx="60" cy="60" r="57" fill="none" stroke="#FB923C" stroke-width="2" stroke-opacity="0.65"/>
  <path d="M24 118 Q36 90 60 90 Q84 90 96 118 Z" fill="url(#rohanKurta)"/>
  <path d="M50 90 L50 84 Q60 81 70 84 L70 90 Z" fill="#FDE047"/>
  <line x1="60" y1="84" x2="60" y2="118" stroke="#FEF08A" stroke-width="2.5"/>
  <rect x="52" y="70" width="16" height="18" rx="4" fill="url(#rohanSkin)"/>
  <path d="M36 46 Q42 22 62 22 Q80 24 84 46 Q72 35 60 35 Q48 35 36 46 Z" fill="#18181B"/>
  <ellipse cx="60" cy="58" rx="22" ry="25" fill="url(#rohanSkin)"/>
  <ellipse cx="37" cy="58" rx="3.5" ry="5.5" fill="#D97706"/>
  <ellipse cx="83" cy="58" rx="3.5" ry="5.5" fill="#D97706"/>
  <path d="M43 47 Q50 43 57 46" stroke="#18181B" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <path d="M63 46 Q70 43 77 47" stroke="#18181B" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <ellipse cx="50" cy="52" rx="4.5" ry="3" fill="#FFF"/>
  <circle cx="51.5" cy="52" r="2.2" fill="#18181B"/>
  <ellipse cx="70" cy="52" rx="4.5" ry="3" fill="#FFF"/>
  <circle cx="71.5" cy="52" r="2.2" fill="#18181B"/>
  <line x1="60" y1="36" x2="60" y2="44" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M60 50 L60 62 Q63 63 60 64" stroke="#92400E" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <path d="M51 68 Q60 76 69 68" stroke="#78350F" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M52 68 Q60 75 68 68" fill="#FFF"/>
</svg>
`)}`;

export const DEMO_FACE_MAP: Record<string, string> = {
  aarav: AARAV_SVG_DATA_URI,
  priya: PRIYA_SVG_DATA_URI,
  kabir: KABIR_SVG_DATA_URI,
  ananya: ANANYA_SVG_DATA_URI,
  meera: MEERA_SVG_DATA_URI,
  rohan: ROHAN_SVG_DATA_URI
};

/**
 * Returns a guaranteed valid Data URI for a given character ID or name.
 */
export const getFallbackAvatarForCharacter = (idOrName: string): string => {
  const key = idOrName.toLowerCase();
  if (key.includes('aarav')) return AARAV_SVG_DATA_URI;
  if (key.includes('priya')) return PRIYA_SVG_DATA_URI;
  if (key.includes('kabir')) return KABIR_SVG_DATA_URI;
  if (key.includes('ananya')) return ANANYA_SVG_DATA_URI;
  if (key.includes('meera')) return MEERA_SVG_DATA_URI;
  if (key.includes('rohan')) return ROHAN_SVG_DATA_URI;
  return AARAV_SVG_DATA_URI;
};
