import { CharacterAccessory, CharacterData, CrackerDefinition, DressStyle, SweetDefinition } from '../types';
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

// Direct ES module imports so Vite bundles and resolves hashed asset URLs cleanly
import courtyardImg from '../assets/images/starlit_diwali_courtyard_1794627143631.jpg';
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
    name: 'Starlit Courtyard',
    hindiName: 'दीप आँगन',
    url: courtyardImg,
    fallbackUrl: PROCEDURAL_COURTYARD_SVG,
    description: 'Illuminated traditional courtyard with glowing tree lanterns, clay diyas, and marigold flower rangoli under twinkling stars.'
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
    accentColor: '#F59E0B',
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
    accentColor: '#EC4899',
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
    accentColor: '#60A5FA',
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
    accentColor: '#EF4444',
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
    accentColor: '#8B5CF6',
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

export const AVATAR_PRESETS: Array<{
  id: string;
  label: string;
  gender: 'female' | 'male';
  url: string;
  defaultDress: DressStyle;
}> = [
  { id: 'priya', label: 'Priya', gender: 'female', url: priyaImg || PRIYA_SVG_DATA_URI, defaultDress: 'saree' },
  { id: 'ananya', label: 'Ananya', gender: 'female', url: ananyaImg || ANANYA_SVG_DATA_URI, defaultDress: 'lehenga' },
  { id: 'meera', label: 'Meera', gender: 'female', url: PRIYA_SVG_DATA_URI, defaultDress: 'suit' },
  { id: 'aarav', label: 'Aarav', gender: 'male', url: aaravImg || AARAV_SVG_DATA_URI, defaultDress: 'kurta' },
  { id: 'kabir', label: 'Kabir', gender: 'male', url: kabirImg || KABIR_SVG_DATA_URI, defaultDress: 'sherwani' },
  { id: 'rohan', label: 'Rohan', gender: 'male', url: ANANYA_SVG_DATA_URI, defaultDress: 'kurta' }
];


export interface DressStyleOption {
  id: DressStyle;
  label: string;
  hindiLabel: string;
  recommendedGender: 'female' | 'male';
  subtitle: string;
}

export const DRESS_STYLE_OPTIONS: DressStyleOption[] = [
  {
    id: 'saree',
    label: 'Saree',
    hindiLabel: 'साड़ी',
    recommendedGender: 'female',
    subtitle: 'Draped silk pallu & gold zari border'
  },
  {
    id: 'lehenga',
    label: 'Lehenga',
    hindiLabel: 'लहंगा चोली',
    recommendedGender: 'female',
    subtitle: 'Flared festive skirt, choli & gota trim'
  },
  {
    id: 'anarkali',
    label: 'Anarkali',
    hindiLabel: 'अनारकली',
    recommendedGender: 'female',
    subtitle: 'Floor-length pleated flare & embroidered bodice'
  },
  {
    id: 'suit',
    label: 'Salwar Suit',
    hindiLabel: 'सलवार सूट',
    recommendedGender: 'female',
    subtitle: 'Long embroidered kameez, dupatta & salwar'
  },
  {
    id: 'kurta',
    label: 'Kurta-Pajama',
    hindiLabel: 'कुर्ता पजामा',
    recommendedGender: 'male',
    subtitle: 'Silk kurta with zari placket & churidar'
  },
  {
    id: 'sherwani',
    label: 'Sherwani',
    hindiLabel: 'शेरवानी',
    recommendedGender: 'male',
    subtitle: 'Royal festive coat with zari buttons & jutti'
  },
  {
    id: 'indo_western',
    label: 'Indo-Western',
    hindiLabel: 'इंडो-वेस्टर्न',
    recommendedGender: 'male',
    subtitle: 'Asymmetrical bandhgala jacket with pocket square'
  }
];

export interface OutfitColorPreset {
  id: string;
  label: string;
  outfitColor: string;
  accentBg: string;
  swatchClass: string;
}

export const OUTFIT_COLOR_PRESETS: OutfitColorPreset[] = [
  {
    id: 'crimson',
    label: 'Crimson Rose',
    outfitColor: 'from-rose-600 to-red-800',
    accentBg: 'border-rose-400',
    swatchClass: 'bg-gradient-to-br from-rose-500 to-red-700'
  },
  {
    id: 'gold',
    label: 'Marigold Gold',
    outfitColor: 'from-amber-500 to-yellow-600',
    accentBg: 'border-amber-400',
    swatchClass: 'bg-gradient-to-br from-amber-400 to-yellow-600'
  },
  {
    id: 'emerald',
    label: 'Emerald Silk',
    outfitColor: 'from-emerald-600 to-teal-800',
    accentBg: 'border-emerald-400',
    swatchClass: 'bg-gradient-to-br from-emerald-500 to-teal-700'
  },
  {
    id: 'royal_blue',
    label: 'Peacock Blue',
    outfitColor: 'from-blue-600 to-indigo-900',
    accentBg: 'border-blue-400',
    swatchClass: 'bg-gradient-to-br from-blue-500 to-indigo-800'
  },
  {
    id: 'purple',
    label: 'Royal Plum',
    outfitColor: 'from-purple-600 to-fuchsia-900',
    accentBg: 'border-purple-400',
    swatchClass: 'bg-gradient-to-br from-purple-500 to-fuchsia-800'
  },
  {
    id: 'saffron',
    label: 'Festive Saffron',
    outfitColor: 'from-orange-500 to-red-700',
    accentBg: 'border-orange-400',
    swatchClass: 'bg-gradient-to-br from-orange-500 to-red-600'
  },
  {
    id: 'ivory_gold',
    label: 'Ivory Zari',
    outfitColor: 'from-stone-200 to-amber-200',
    accentBg: 'border-amber-300',
    swatchClass: 'bg-gradient-to-br from-stone-100 to-amber-200'
  },
  {
    id: 'teal_cyan',
    label: 'Jaipur Teal',
    outfitColor: 'from-cyan-600 to-teal-900',
    accentBg: 'border-cyan-400',
    swatchClass: 'bg-gradient-to-br from-cyan-500 to-teal-800'
  }
];

export interface AccessoryOption {
  id: CharacterAccessory;
  label: string;
  hindiLabel: string;
  recommendedGender: 'all' | 'female' | 'male';
  description: string;
}

export const ACCESSORY_OPTIONS: AccessoryOption[] = [
  {
    id: 'none',
    label: 'None',
    hindiLabel: 'सादा लुक',
    recommendedGender: 'all',
    description: 'Classic clean festive silhouette'
  },
  {
    id: 'dupatta',
    label: 'Zari Dupatta',
    hindiLabel: 'ज़री दुपट्टा',
    recommendedGender: 'female',
    description: 'Sheer gold-trimmed silk dupatta drape'
  },
  {
    id: 'shawl',
    label: 'Festive Stole',
    hindiLabel: 'शॉल / अंगवस्त्र',
    recommendedGender: 'male',
    description: 'Embroidered silk stole draped across shoulders'
  },
  {
    id: 'pagdi',
    label: 'Royal Pagdi',
    hindiLabel: 'शाही पगड़ी',
    recommendedGender: 'male',
    description: 'Festive turban with jeweled kalgi feather'
  },
  {
    id: 'jhumka',
    label: 'Chandbali Jhumka',
    hindiLabel: 'चांदबाली झुमके',
    recommendedGender: 'female',
    description: 'Traditional gold & pearl dangling earrings'
  },
  {
    id: 'mala',
    label: 'Pearl Kantha Mala',
    hindiLabel: 'मोती माला',
    recommendedGender: 'all',
    description: 'Layered festive pearl & ruby necklace'
  },
  {
    id: 'bindi',
    label: 'Maang-Tikka & Bindi',
    hindiLabel: 'मांग टीका व बिंदी',
    recommendedGender: 'female',
    description: 'Radiant forehead tikka & crimson bindi'
  },
  {
    id: 'glasses',
    label: 'Festive Shades',
    hindiLabel: 'स्टाइलिश चश्मा',
    recommendedGender: 'all',
    description: 'Gold-rimmed celebratory aviators'
  }
];

const FEMALE_NAMES = new Set([
  'priya', 'ananya', 'sneha', 'pooja', 'puja', 'neha', 'kavya', 'riya', 'diya', 'meera',
  'aarti', 'arti', 'divya', 'shreya', 'aditi', 'nisha', 'sonia', 'sonam', 'kriti', 'kirti',
  'tanvi', 'anjali', 'sakshi', 'khushi', 'ishita', 'tanya', 'simran', 'muskan', 'nikita',
  'pallavi', 'rashmi', 'swati', 'komal', 'jyoti', 'deepika', 'katrina', 'alia', 'shraddha',
  'radha', 'sita', 'gita', 'laxmi', 'lakshmi', 'sarah', 'emma', 'sophia', 'maya', 'tara',
  'nandini', 'vaishnavi', 'bhavna', 'kanika', 'manisha', 'priyanka', 'ritika', 'shruti',
  'pragya', 'palak', 'mansi', 'shweta', 'anchal', 'aanchal', 'richa', 'mahima', 'payal'
]);

const MALE_NAMES = new Set([
  'aarav', 'kabir', 'rohan', 'shivansh', 'vikram', 'rahul', 'arjun', 'aditya', 'karan', 'dev',
  'varun', 'raj', 'amit', 'rohit', 'ankit', 'aman', 'ayush', 'aayush', 'harsh', 'gaurav',
  'saurabh', 'vivek', 'vishal', 'nikhil', 'akash', 'aakash', 'sahil', 'kartik', 'kunal',
  'yash', 'manish', 'deepak', 'mohit', 'sumit', 'siddharth', 'prashant', 'ravi', 'sanjay',
  'ajay', 'vijay', 'suraj', 'tarun', 'abhishek', 'tushar', 'pankaj', 'alok', 'rajesh',
  'mayank', 'naman', 'pranav', 'ishaan', 'krishna', 'ram', 'shyam', 'john', 'alex', 'sam'
]);

export const inferGenderFromName = (name: string): 'female' | 'male' | null => {
  const firstWord = name.trim().toLowerCase().split(/\s+/)[0];
  if (!firstWord || firstWord.length < 2) return null;
  if (FEMALE_NAMES.has(firstWord)) return 'female';
  if (MALE_NAMES.has(firstWord)) return 'male';
  return null;
};

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
