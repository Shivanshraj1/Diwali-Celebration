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

export type CharacterActionState =
  | 'idle'
  | 'walking'
  | 'igniting'
  | 'running_back'
  | 'covering_ears'
  | 'celebrating'
  | 'sweets';

export type DressStyle =
  | 'lehenga'
  | 'saree'
  | 'anarkali'
  | 'suit'
  | 'kurta'
  | 'sherwani'
  | 'indo_western';

export type CharacterAccessory =
  | 'none'
  | 'dupatta'
  | 'pagdi'
  | 'shawl'
  | 'jhumka'
  | 'mala'
  | 'bindi'
  | 'glasses';

export type BgSceneId = 'courtyard' | 'playground' | 'terrace';

export type WeatherMode = 'starlit' | 'lanterns' | 'mist' | 'distant_fireworks';

export interface CharacterData {
  id: string;
  uid?: string;
  name: string;
  relation: string;
  outfitColor: string;
  accentBg: string;
  avatarUrl: string;
  xPercent: number; // 0 to 100 on the arena floor
  yPercent: number; // 45 to 92
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
  dressStyle?: DressStyle;
  accessory?: CharacterAccessory;
  online?: boolean;
  isCurrentUser?: boolean;
  isHost?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  gender: 'female' | 'male';
  dressStyle: DressStyle;
  outfitColor: string;
  accentBg: string;
  accessory?: CharacterAccessory;
}

export interface CelebrationRoom {
  roomId: string;
  title: string;
  hostUid: string;
  hostName: string;
  inviteCode: string;
  bgScene: BgSceneId;
  weatherMode: WeatherMode;
  crackersIgnited: number;
  sweetsShared: number;
  wishesSent: number;
  diyasLit: number;
}

export interface RoomInvite {
  inviteCode: string;
  roomId: string;
  roomTitle: string;
  hostUid: string;
  hostName: string;
  status: 'active' | 'revoked';
  expiresAtMs: number;
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

export type AppPhase = 'countdown' | 'arena';

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
  type: 'join' | 'leave' | 'cracker' | 'sweet' | 'wish' | 'diya' | 'interact' | 'joy';
  text: string;
  sender?: string;
  senderPhotoURL?: string;
  timestamp: number;
}

export interface RoomChatMessage {
  messageId: string;
  roomId: string;
  uid: string;
  senderName: string;
  senderPhotoURL?: string;
  text: string;
  kind: 'chat' | 'greeting';
  recipientUid?: string;
  recipientName?: string;
  createdAtMs: number;
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
