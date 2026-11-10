import { CharacterData, CrackerDefinition, SweetDefinition } from '../types';
import {
  AARAV_SVG_DATA_URI,
  PRIYA_SVG_DATA_URI,
  KABIR_SVG_DATA_URI,
  ANANYA_SVG_DATA_URI
} from '../assets/demoFaces';
import {
  PROCEDURAL_COURTYARD_SVG,
  PROCEDURAL_PLAYGROUND_SVG,
  PROCEDURAL_TERRACE_SVG
} from '../assets/proceduralBackgrounds';

// Direct ES module imports so Vite bundles and resolves hashed asset URLs in production / GitHub Pages
import courtyardImg from '../assets/images/moonlit_courtyard_glow_1794207930774.jpg';
import playgroundImg from '../assets/images/playground_diwali_celebration_1794201549291.jpg';
import terraceImg from '../assets/images/empty_calm_diwali_terrace_1794201037157.jpg';

import aaravImg from '../assets/images/festive_aarav_portrait_1794199836165.jpg';
import priyaImg from '../assets/images/festive_priya_portrait_1794199836439.jpg';
import kabirImg from '../assets/images/festive_kabir_portrait_1794199837314.jpg';
import ananyaImg from '../assets/images/festive_ananya_portrait_1794199838788.jpg';

export {
  courtyardImg,
  playgroundImg,
  terraceImg,
  aaravImg,
  priyaImg,
  kabirImg,
  ananyaImg
};

export interface BackgroundOption {
  id: 'courtyard' | 'playground' | 'terrace';
  name: string;
  hindiName: string;
  url: string;
  fallbackUrl: string;
  description: string;
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  {
    id: 'courtyard',
    name: 'Moonlit Courtyard',
    hindiName: 'चंद्रोदय आँगन',
    url: courtyardImg,
    fallbackUrl: PROCEDURAL_COURTYARD_SVG,
    description: 'Illuminated traditional courtyard with glowing tree lanterns, clay diyas, and flower rangoli under a full moon.'
  },
  {
    id: 'playground',
    name: 'Celebration Ground',
    hindiName: 'उत्सव मैदान',
    url: playgroundImg,
    fallbackUrl: PROCEDURAL_PLAYGROUND_SVG,
    description: 'Vibrant open community ground filled with festival fairy lights, glowing arches, and cheerful celebration.'
  },
  {
    id: 'terrace',
    name: 'Rooftop Terrace',
    hindiName: 'शांत छत',
    url: terraceImg,
    fallbackUrl: PROCEDURAL_TERRACE_SVG,
    description: 'Serene stone terrace lined with clay oil diyas and flower rangoli overlooking the illuminated city.'
  }
];

export const COURTYARD_BACKDROP = BACKGROUND_OPTIONS[0].url;

export const CRACKER_DEFINITIONS: Record<string, CrackerDefinition> = {
  charkhi: {
    type: 'charkhi',
    name: 'Charkhi',
    hindiName: 'चक्री',
    subtitle: 'Ground Spinner',
    durationSeconds: 5,
    icon: 'disc',
    accentColor: '#F59E0B', // Amber
    sparkColors: ['#FDE047', '#F59E0B', '#10B981', '#3B82F6', '#FFFFFF'],
    description: 'Rapidly spins at high RPM, throwing golden centrifugal sparks in mesmerizing radial spirals.',
    safetyTip: 'Placed flat on open stone paving, maintain 5ft distance.'
  },
  anar: {
    type: 'anar',
    name: 'Anar',
    hindiName: 'अनार',
    subtitle: 'Flower Pot Fountain',
    durationSeconds: 5.5,
    icon: 'cone',
    accentColor: '#EC4899', // Pink / Gold
    sparkColors: ['#FDE047', '#FB7185', '#E11D48', '#C084FC', '#FFFFFF'],
    description: 'Erupts into a towering incandescent volcanic fountain of sparkling gold, silver, and crimson.',
    safetyTip: 'Never lean over the cone; ignite from arm’s length.'
  },
  phooljhadi: {
    type: 'phooljhadi',
    name: 'Phooljhadi',
    hindiName: 'फुलझड़ी',
    subtitle: 'Sparkler Wand',
    durationSeconds: 7,
    icon: 'wand',
    accentColor: '#60A5FA', // Blue / White
    sparkColors: ['#FFFFFF', '#BAE6FD', '#38BDF8', '#FDE047'],
    description: 'Held in hand to weave shimmering trails of starlight sparks that dance playfully in the night air.',
    safetyTip: 'Hold away from clothing and body; immerse wire in water when spent.'
  },
  rocket: {
    type: 'rocket',
    name: 'Rocket',
    hindiName: 'रॉकेट',
    subtitle: 'Aerial Swoosh',
    durationSeconds: 3.5,
    icon: 'rocket',
    accentColor: '#EF4444', // Red
    sparkColors: ['#F97316', '#EF4444', '#FBBF24', '#34D399', '#A855F7'],
    description: 'Screeches skyward with a fiery smoke trail before bursting into a multi-colored peony bloom high above.',
    safetyTip: 'Launch strictly from an upright bottle or angled launch tube.'
  },
  skyshot: {
    type: 'skyshot',
    name: 'Skyshots',
    hindiName: 'स्काई शॉट',
    subtitle: 'Multi-Aerial Battery',
    durationSeconds: 6,
    icon: 'sparkles',
    accentColor: '#8B5CF6', // Purple
    sparkColors: ['#EC4899', '#8B5CF6', '#F59E0B', '#06B6D4', '#22C55E', '#FFFFFF'],
    description: 'Fires sequential high-caliber shells that explode into gigantic glittering chrysanthemums with thunderous echoes.',
    safetyTip: 'Ensure overhead clearance is completely free of trees or awnings.'
  },
  sky_letters: {
    type: 'sky_letters',
    name: 'Sky Calligraphy',
    hindiName: 'आकाश दीप',
    subtitle: 'Happy Diwali in Sky',
    durationSeconds: 7.5,
    icon: 'type',
    accentColor: '#F59E0B',
    sparkColors: ['#FDE047', '#F59E0B', '#EF4444', '#10B981', '#FFFFFF'],
    description: 'Roars skyward before detonating into glittering starlight words spelling "HAPPY DIWALI TO ALL" across the heavens.',
    safetyTip: 'Step back and look straight up into the starry sky.'
  }
};

export const INITIAL_CHARACTERS: CharacterData[] = [
  {
    id: 'aarav',
    name: 'Aarav',
    relation: 'Celebration Host',
    outfitColor: 'from-amber-500 to-yellow-600',
    accentBg: 'border-amber-400',
    avatarUrl: aaravImg || AARAV_SVG_DATA_URI,
    xPercent: 18,
    yPercent: 74,
    direction: 'right',
    state: 'idle',
    happiness: 95,
    gender: 'male'
  },
  {
    id: 'priya',
    name: 'Priya',
    relation: 'Diya Lighting Artist',
    outfitColor: 'from-rose-600 to-red-800',
    accentBg: 'border-rose-400',
    avatarUrl: priyaImg || PRIYA_SVG_DATA_URI,
    xPercent: 39,
    yPercent: 78,
    direction: 'right',
    state: 'idle',
    happiness: 98,
    gender: 'female'
  },
  {
    id: 'kabir',
    name: 'Kabir',
    relation: 'Pyrotechnic Enthusiast',
    outfitColor: 'from-blue-600 to-indigo-900',
    accentBg: 'border-blue-400',
    avatarUrl: kabirImg || KABIR_SVG_DATA_URI,
    xPercent: 63,
    yPercent: 73,
    direction: 'left',
    state: 'idle',
    happiness: 92,
    gender: 'male'
  },
  {
    id: 'ananya',
    name: 'Ananya',
    relation: 'Sweets & Rangoli Curator',
    outfitColor: 'from-emerald-600 to-teal-800',
    accentBg: 'border-emerald-400',
    avatarUrl: ananyaImg || ANANYA_SVG_DATA_URI,
    xPercent: 82,
    yPercent: 76,
    direction: 'left',
    state: 'idle',
    happiness: 97,
    gender: 'female'
  }
];

export const SWEET_DEFINITIONS: Record<string, SweetDefinition> = {
  kaju_katli: {
    type: 'kaju_katli',
    name: 'Kaju Katli',
    hindiName: 'काजू कतली',
    ingredients: 'Ground Cashew, Sugar, Silver Vark',
    description: 'Iconic diamond-shaped silver-leaf delicacy melting smoothly with pure nutty cashew essence.',
    symbol: '◆',
    blessing: 'May your life sparkle with silver brilliance and sweet abundance!'
  },
  motichoor_ladoo: {
    type: 'motichoor_ladoo',
    name: 'Motichoor Ladoo',
    hindiName: 'मोतीचूर लड्डू',
    ingredients: 'Gram Flour Pearls, Pure Ghee, Saffron, Pistachio',
    description: 'Golden spheres of fine fried chickpea droplets bonded with saffron syrup and dry fruits.',
    symbol: '●',
    blessing: 'May happiness roll in like sweet golden blessings!'
  },
  gulab_jamun: {
    type: 'gulab_jamun',
    name: 'Gulab Jamun',
    hindiName: 'गुलाब जामुन',
    ingredients: 'Khoya Dumplings, Cardamom, Rose Water Sugar Syrup',
    description: 'Deep golden berry dumplings warm to the touch, soaked in fragrant rose and green cardamom nectar.',
    symbol: '◉',
    blessing: 'May every moment of your year be soaked in warmth and love!'
  },
  jalebi: {
    type: 'jalebi',
    name: 'Crispy Jalebi',
    hindiName: 'जलेबी',
    ingredients: 'Fermented Flour Spirals, Saffron Sugar Glaze',
    description: 'Crispy fried golden pretzel spirals bursting with warm citrus saffron syrup on every crunch.',
    symbol: '◎',
    blessing: 'May life swirl with vibrant festive crunch and delightful surprises!'
  },
  besan_barfi: {
    type: 'besan_barfi',
    name: 'Besan Barfi',
    hindiName: 'बेसन बर्फी',
    ingredients: 'Roasted Gram Flour, Desi Ghee, Almond Slivers',
    description: 'Rich, melt-in-the-mouth fudge slow-roasted to golden aromatic perfection.',
    symbol: '◼',
    blessing: 'Wishing solid prosperity, good health, and joyful reunions!'
  }
};
