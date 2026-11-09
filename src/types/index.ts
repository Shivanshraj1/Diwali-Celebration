export type CrackerType = 'charkhi' | 'anar' | 'phooljhadi' | 'rocket' | 'skyshot' | 'sky_letters';

export interface CrackerDefinition {
  type: CrackerType;
  name: string;
  hindiName: string;
  subtitle: string;
  durationSeconds: number;
  icon: string;
  accentColor: string;
  sparkColors: string[];
  description: string;
  safetyTip: string;
}

export type CharacterActionState = 'idle' | 'walking' | 'igniting' | 'running_back' | 'covering_ears' | 'celebrating' | 'sweets';

export interface CharacterData {
  id: string;
  name: string;
  relation: string;
  outfitColor: string;
  accentBg: string;
  avatarUrl: string;
  xPercent: number; // 0 to 100 on the arena floor
  yPercent: number; // 50 to 90
  direction: 'left' | 'right';
  state: CharacterActionState;
  stateTimer?: number;
  speechBubble?: {
    text: string;
    expiresAt: number;
  } | null;
  happiness: number;
  holdingSparkler?: boolean;
  gender?: 'male' | 'female';
}

export type SweetType = 'kaju_katli' | 'motichoor_ladoo' | 'gulab_jamun' | 'jalebi' | 'besan_barfi';

export interface SweetDefinition {
  type: SweetType;
  name: string;
  hindiName: string;
  ingredients: string;
  description: string;
  symbol: string;
  blessing: string;
}

export type AppPhase = 'intro' | 'countdown' | 'showreel' | 'arena';

export interface ActiveCracker {
  id: string;
  type: CrackerType;
  x: number; // pixel coords in arena
  y: number;
  ignitedByCharacterId?: string;
  stage: 'fusing' | 'active' | 'finished';
  startTime: number;
  fuseEndTime: number;
  endTime: number;
  colorScheme: string[];
}

export interface CelebrationActivity {
  id: string;
  type: 'cracker' | 'sweet' | 'wish' | 'diya';
  text: string;
  sender?: string;
  timestamp: number;
}

export interface GlobalCelebrationStats {
  activeUsers: number;
  totalCelebrations: number;
  crackersIgnited: number;
  sweetsShared: number;
  wishesSent: number;
  diyasLit: number;
  recentActivities: CelebrationActivity[];
}

