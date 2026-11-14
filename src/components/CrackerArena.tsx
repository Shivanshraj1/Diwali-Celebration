import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  BgSceneId,
  CelebrationActivity,
  CelebrationRoom,
  CharacterActionState,
  CharacterData,
  CrackerType,
  ActiveCracker,
  RoomChatMessage,
  SweetType,
  UserProfile,
  WeatherMode
} from '../types';
import { CRACKER_DEFINITIONS, BACKGROUND_OPTIONS, SWEET_DEFINITIONS } from '../data/constants';
import { Character } from './Character';
import { ParticleCanvas } from './ParticleCanvas';
import { ConfettiCanvas, JoyBurstSignal } from './ConfettiCanvas';
import { AmbientEmbersCanvas } from './AmbientEmbersCanvas';
import { InventoryDock } from './InventoryDock';
import { SweetsBoxModal } from './SweetsBoxModal';
import { DynamicWeatherSky } from './DynamicWeatherSky';
import { ManageCharactersModal } from './ManageCharactersModal';
import { HangingLanterns } from './HangingLanterns';
import { GlobalCelebrationBadge } from './GlobalCelebrationBadge';
import { GlobalCelebrationModal } from './GlobalCelebrationModal';
import { AtmosphereControlsModal } from './AtmosphereControlsModal';
import { RoomChatPanel } from './RoomChatPanel';
import { CrackerSoundboard } from './CrackerSoundboard';
import { AvatarImage } from './AvatarImage';
import { soundEngine } from '../audio/soundEngine';
import {
  subscribeToRoom,
  subscribeToParticipants,
  subscribeToRoomEvents,
  subscribeToRoomMessages,
  sendRoomMessage,
  deleteRoomMessage,
  updateOwnParticipant,
  broadcastCrackerAction,
  broadcastSweetAction,
  broadcastWishOrDiyaOrInteract,
  broadcastJoyExplosion,
  updateRoomSceneOrWeather,
  FirestoreEventDoc
} from '../services/firestoreCelebration';
import {
  Volume2,
  VolumeX,
  Music,
  Info,
  Sparkles,
  Flame,
  CheckCircle2,
  Users,
  Stars,
  Gift,
  Sliders,
  Share2,
  LogOut,
  WifiOff,
  X,
  MessageCircle,
  Shirt,
  PartyPopper
} from 'lucide-react';

export type ArenaTab = 'terrace' | 'mithai' | 'guide' | 'weather';

interface LiveToast {
  id: string;
  text: string;
  kind: 'join' | 'leave' | 'wish' | 'sweet' | 'info';
}

interface CrackerArenaProps {
  room: CelebrationRoom;
  userProfile: UserProfile;
  googlePhotoUrl?: string | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onReplayGreeting?: () => void;
  onSaveProfile: (updated: UserProfile) => Promise<void>;
  onJoinRoomByCode: (inviteCode: string) => Promise<string | null>;
  onLogout: () => Promise<void>;
}

export const CrackerArena: React.FC<CrackerArenaProps> = ({
  room: initialRoom,
  userProfile,
  googlePhotoUrl,
  isMuted,
  onToggleMute,
  onReplayGreeting,
  onSaveProfile,
  onJoinRoomByCode,
  onLogout
}) => {
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });
  const dimensionsRef = useRef(dimensions);
  useEffect(() => {
    dimensionsRef.current = dimensions;
  }, [dimensions]);

  const [room, setRoom] = useState<CelebrationRoom>(initialRoom);
  const [participants, setParticipants] = useState<CharacterData[]>([]);
  const participantsRef = useRef<CharacterData[]>([]);
  const [activities, setActivities] = useState<CelebrationActivity[]>([]);
  const [latestActivity, setLatestActivity] = useState<CelebrationActivity | undefined>();
  const [toasts, setToasts] = useState<LiveToast[]>([]);

  // Per-character transient client-side animation / speech overlay layered cleanly on live Firestore presence
  const [charAnimations, setCharAnimations] = useState<
    Record<
      string,
      {
        state?: CharacterActionState;
        holdingSparkler?: boolean;
        xPercentOverride?: number;
        directionOverride?: 'left' | 'right';
        speechBubble?: { text: string; expiresAt: number } | null;
      }
    >
  >({});

  const [activeCrackers, setActiveCrackers] = useState<ActiveCracker[]>([]);
  const [activeTab, setActiveTab] = useState<ArenaTab>('terrace');
  const [localBgScene, setLocalBgScene] = useState<BgSceneId>(initialRoom.bgScene || 'courtyard');
  const [localWeatherMode, setLocalWeatherMode] = useState<WeatherMode>(initialRoom.weatherMode || 'starlit');
  const [bgError, setBgError] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [selectedCrackerForPlacement, setSelectedCrackerForPlacement] = useState<CrackerType | null>(null);
  const [selectedFriendForAction, setSelectedFriendForAction] = useState<CharacterData | null>(null);

  const [isManagePeopleOpen, setIsManagePeopleOpen] = useState(false);
  const [managePeopleSubTab, setManagePeopleSubTab] = useState<'people' | 'invite' | 'customize'>('people');
  const [isGlobalStatsOpen, setIsGlobalStatsOpen] = useState(false);
  const [isAtmosphereModalOpen, setIsAtmosphereModalOpen] = useState(false);
  const [isSoundboardOpen, setIsSoundboardOpen] = useState(false);

  // Real-time room chat state
  const [chatMessages, setChatMessages] = useState<RoomChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isChatOpenRef = useRef(false);
  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
    if (isChatOpen) setUnreadChatCount(0);
  }, [isChatOpen]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [chatRecipientHint, setChatRecipientHint] = useState<{ uid: string; name: string } | null>(null);

  const [isOnlineNetwork, setIsOnlineNetwork] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [loggingOut, setLoggingOut] = useState(false);

  // Screen-wide Share Joy confetti & celebration milestone state
  const [joyBurstSignal, setJoyBurstSignal] = useState<JoyBurstSignal | null>(null);
  const [joyBanner, setJoyBanner] = useState<string | null>(null);
  const [shareJoyCooldown, setShareJoyCooldown] = useState(false);
  const lastJoySentAtRef = useRef(0);
  const personalActionsRef = useRef(0);

  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const shownToastEventIdsRef = useRef<Set<string>>(new Set());
  const timeoutsRef = useRef<Set<number>>(new Set());

  const scheduleTimeout = useCallback((fn: () => void, delayMs: number) => {
    const id = window.setTimeout(() => {
      timeoutsRef.current.delete(id);
      fn();
    }, delayMs);
    timeoutsRef.current.add(id);
    return id;
  }, []);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current.clear();
    };
  }, []);

  const isHost = room.hostUid === userProfile.uid;

  useEffect(() => {
    setRoom(initialRoom);
    setLocalBgScene(initialRoom.bgScene || 'courtyard');
    setLocalWeatherMode(initialRoom.weatherMode || 'starlit');
  }, [initialRoom]);

  const pushToast = useCallback((text: string, kind: LiveToast['kind'] = 'info', dedupeKey?: string) => {
    if (dedupeKey) {
      if (shownToastEventIdsRef.current.has(dedupeKey)) return;
      shownToastEventIdsRef.current.add(dedupeKey);
    }
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, text, kind }]);
    scheduleTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, [scheduleTimeout]);

  // Network online/offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnlineNetwork(true);
    const handleOffline = () => setIsOnlineNetwork(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Viewport resize listener
  useEffect(() => {
    const handleResize = () => {
      if (arenaRef.current) {
        setDimensions({
          width: arenaRef.current.clientWidth,
          height: arenaRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Expire speech bubbles cleanly
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCharAnimations((prev) => {
        let changed = false;
        const next = { ...prev };
        Object.keys(next).forEach((uid) => {
          const entry = next[uid];
          if (entry?.speechBubble && now > entry.speechBubble.expiresAt) {
            next[uid] = { ...entry, speechBubble: null };
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Presence heartbeat every 45s so friend list stays genuine and accurate
  useEffect(() => {
    const heartbeat = setInterval(() => {
      void updateOwnParticipant(room.roomId, userProfile.uid, { online: true });
    }, 45000);

    return () => {
      clearInterval(heartbeat);
    };
  }, [room.roomId, userProfile.uid]);

  const setCharacterTransientState = useCallback(
    (
      uid: string,
      patch: Partial<{
        state: CharacterActionState;
        holdingSparkler: boolean;
        xPercentOverride: number | undefined;
        directionOverride: 'left' | 'right' | undefined;
        speechBubble: { text: string; expiresAt: number } | null;
      }>
    ) => {
      setCharAnimations((prev) => ({
        ...prev,
        [uid]: {
          ...prev[uid],
          ...patch
        }
      }));
    },
    []
  );

  const triggerLocalJoyVisuals = useCallback(
    (senderUid: string, label: string) => {
      soundEngine.playShareJoyConfetti();
      setJoyBurstSignal({ id: Date.now() + Math.random(), label });
      setJoyBanner(label);

      scheduleTimeout(() => {
        setJoyBanner((current) => (current === label ? null : current));
      }, 3600);

      setCharacterTransientState(senderUid, {
        state: 'celebrating',
        speechBubble: {
          text: label.slice(0, 72),
          expiresAt: Date.now() + 4000
        }
      });

      scheduleTimeout(() => {
        setCharacterTransientState(senderUid, { state: 'idle' });
      }, 2800);
    },
    [scheduleTimeout, setCharacterTransientState]
  );

  const handleShareJoy = useCallback(
    async (customDetail?: string, bypassCooldown = false) => {
      const now = Date.now();
      if (!bypassCooldown && now - lastJoySentAtRef.current < 1400) return;
      lastJoySentAtRef.current = now;

      if (!bypassCooldown) {
        setShareJoyCooldown(true);
        scheduleTimeout(() => setShareJoyCooldown(false), 1400);
      }

      const label =
        customDetail?.trim() || `${userProfile.displayName} shared Diwali Joy with everyone!`;
      triggerLocalJoyVisuals(userProfile.uid, label);

      await broadcastJoyExplosion(room.roomId, userProfile, label);
    },
    [room.roomId, scheduleTimeout, triggerLocalJoyVisuals, userProfile]
  );

  const recordPersonalCelebrationStep = useCallback(() => {
    personalActionsRef.current += 1;
    const count = personalActionsRef.current;
    if (count === 5 || count === 15 || count === 30 || count === 50 || count === 100) {
      void handleShareJoy(
        `Milestone! ${userProfile.displayName} reached ${count} celebration moments!`,
        true
      );
    }
  }, [handleShareJoy, userProfile.displayName]);

  // Audio-only preview helper (visual crackers trigger frame-locked audio directly in ParticleCanvas)
  const triggerCrackerAudio = useCallback((type: CrackerType) => {
    const def = CRACKER_DEFINITIONS[type];
    switch (type) {
      case 'charkhi':
        soundEngine.playCharkhiSound(def.durationSeconds);
        break;
      case 'anar':
        soundEngine.playAnarSound(def.durationSeconds);
        break;
      case 'phooljhadi':
        soundEngine.playPhooljhadiSound(def.durationSeconds);
        break;
      case 'rocket':
        soundEngine.playRocketSound(0.88);
        break;
      case 'skyshot':
        soundEngine.playSkyshotSound(7);
        break;
      case 'sky_letters': {
        const stopLaunch = soundEngine.startRocketLaunchSound(0.97);
        scheduleTimeout(() => {
          stopLaunch();
          soundEngine.playHappyDiwaliBlast(true);
        }, 970);
        break;
      }
    }
  }, [scheduleTimeout]);

  // Firework ignition choreography (works identically for local taps, soundboard sync, and remote Firestore sync)
  const igniteCrackerAt = useCallback(
    (
      type: CrackerType,
      x: number,
      y: number,
      characterUid?: string,
      isRemote = false,
      skipFuse = false
    ) => {
      const def = CRACKER_DEFINITIONS[type];
      const now = performance.now();
      const fuseDuration = skipFuse ? 0 : 950;
      const totalDuration = def.durationSeconds * 1000 + fuseDuration;

      if (!isRemote) {
        const dims = dimensionsRef.current;
        const xPercent = (x / Math.max(1, dims.width)) * 100;
        const yPercent = (y / Math.max(1, dims.height)) * 100;
        void broadcastCrackerAction(
          room.roomId,
          userProfile,
          type,
          `${def.name} (${def.hindiName})`,
          xPercent,
          yPercent
        );
        recordPersonalCelebrationStep();
      }

      const newCracker: ActiveCracker = {
        id: `cracker_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        type,
        x,
        y,
        ignitedByCharacterId: characterUid,
        stage: 'fusing',
        startTime: now,
        fuseEndTime: now + fuseDuration,
        endTime: now + totalDuration,
        colorScheme: def.sparkColors
      };

      setActiveCrackers((prev) => [...prev, newCracker]);

      const actorUid = characterUid || userProfile.uid;
      const actor = participantsRef.current.find((c) => c.id === actorUid);
      if (actor) {
        const crackerXPercent = (x / Math.max(1, dimensionsRef.current.width)) * 100;
        const sideStepOffset = crackerXPercent > 50 ? -18 : 18;
        const safeSideX = Math.max(10, Math.min(90, crackerXPercent + sideStepOffset));

        setCharacterTransientState(actorUid, {
          xPercentOverride: Math.max(8, Math.min(92, crackerXPercent + (crackerXPercent > 50 ? 5 : -5))),
          directionOverride: crackerXPercent > 50 ? 'left' : 'right',
          state: 'igniting',
          holdingSparkler: type === 'phooljhadi',
          speechBubble: {
            text: `Lighting ${def.name}! Sambhal ke!`,
            expiresAt: Date.now() + 2400
          }
        });

        scheduleTimeout(() => {
          setCharacterTransientState(actorUid, {
            xPercentOverride: safeSideX,
            directionOverride: safeSideX < crackerXPercent ? 'right' : 'left',
            state: 'running_back',
            speechBubble: {
              text: `Bhaag bhaag! Jal gaya!`,
              expiresAt: Date.now() + 1800
            }
          });
        }, 700);

        scheduleTimeout(() => {
          setCharacterTransientState(actorUid, {
            state: type === 'phooljhadi' ? 'celebrating' : 'covering_ears',
            speechBubble: {
              text: `Wah! What a sparkle!`,
              expiresAt: Date.now() + 2400
            }
          });
        }, 1200);

        scheduleTimeout(() => {
          setCharacterTransientState(actorUid, {
            state: 'celebrating',
            holdingSparkler: false,
            speechBubble: {
              text: `Shubh Deepavali! ✨`,
              expiresAt: Date.now() + 3000
            }
          });
        }, fuseDuration + 1300);

        scheduleTimeout(() => {
          setCharacterTransientState(actorUid, {
            state: 'idle',
            xPercentOverride: undefined,
            directionOverride: undefined,
            speechBubble: null
          });
        }, totalDuration);
      }
    },
    [room.roomId, userProfile, setCharacterTransientState, scheduleTimeout]
  );

  // Live Firestore subscriptions: Room, Participants, Events
  useEffect(() => {
    const unsubRoom = subscribeToRoom(room.roomId, (updatedRoom) => {
      setRoom(updatedRoom);
      setLocalBgScene(updatedRoom.bgScene);
      setLocalWeatherMode(updatedRoom.weatherMode);
    });

    const unsubParticipants = subscribeToParticipants(
      room.roomId,
      userProfile.uid,
      room.hostUid,
      (list) => {
        participantsRef.current = list;
        setParticipants(list);
      }
    );

    const unsubEvents = subscribeToRoomEvents(room.roomId, (nextActivities, freshEvents: FirestoreEventDoc[]) => {
      setActivities(nextActivities);
      if (nextActivities.length > 0) {
        setLatestActivity(nextActivities[0]);
      }

      freshEvents.forEach((ev) => {
        if (ev.type === 'join') {
          soundEngine.playSweetCheer();
          pushToast(`✨ ${ev.senderName} joined the celebration!`, 'join', ev.eventId);
          setCharacterTransientState(ev.uid, {
            state: 'celebrating',
            speechBubble: {
              text: `Happy Diwali everyone! 🪔`,
              expiresAt: Date.now() + 4500
            }
          });
        } else if (ev.type === 'leave') {
          if (ev.uid !== userProfile.uid) {
            pushToast(`${ev.senderName} left the celebration`, 'leave', ev.eventId);
          }
        } else if (ev.type === 'cracker' && ev.uid !== userProfile.uid && ev.crackerType) {
          const dims = dimensionsRef.current;
          const rx = ((ev.xPercent ?? 50) / 100) * Math.max(320, dims.width);
          const ry = ((ev.yPercent ?? 74) / 100) * Math.max(480, dims.height);
          igniteCrackerAt(ev.crackerType, rx, ry, ev.uid, true);
        } else if (ev.type === 'sweet') {
          soundEngine.playSweetCheer();
          if (ev.uid !== userProfile.uid) {
            pushToast(`🍬 ${ev.detail}`, 'sweet', ev.eventId);
          }
          const target = ev.targetUid || ev.uid;
          setCharacterTransientState(target, {
            state: 'sweets',
            speechBubble: {
              text: `Delicious Mithai! Thank you ${ev.senderName}! 🍬`,
              expiresAt: Date.now() + 4200
            }
          });
        } else if (ev.type === 'joy') {
          if (ev.uid !== userProfile.uid) {
            triggerLocalJoyVisuals(ev.uid, ev.detail);
            pushToast(`🎉 ${ev.detail}`, 'wish', ev.eventId);
          }
        } else if (ev.type === 'wish' || ev.type === 'diya' || ev.type === 'interact') {
          soundEngine.playSweetCheer();
          if (ev.uid !== userProfile.uid) {
            pushToast(`🪔 ${ev.detail}`, 'wish', ev.eventId);
          }
          const speakerUid = ev.uid;
          setCharacterTransientState(speakerUid, {
            state: 'celebrating',
            speechBubble: {
              text: ev.detail.slice(0, 70),
              expiresAt: Date.now() + 4500
            }
          });
        }
      });
    });

    const unsubMessages = subscribeToRoomMessages(room.roomId, (nextMessages, freshMessages) => {
      setChatMessages(nextMessages);

      if (freshMessages.length > 0) {
        freshMessages.forEach((msg) => {
          setCharacterTransientState(msg.uid, {
            state: msg.kind === 'greeting' ? 'celebrating' : 'idle',
            speechBubble: {
              text: `${msg.recipientName ? `@${msg.recipientName}: ` : ''}${msg.text.slice(0, 72)}`,
              expiresAt: Date.now() + 5000
            }
          });

          if (msg.uid !== userProfile.uid) {
            if (msg.kind === 'greeting') {
              soundEngine.playSweetCheer();
            }
            if (!isChatOpenRef.current) {
              setUnreadChatCount((prev) => prev + 1);
              pushToast(
                `💬 ${msg.senderName}: ${msg.text.slice(0, 48)}`,
                'wish',
                msg.messageId
              );
            }
          }
        });
      }
    });

    return () => {
      unsubRoom();
      unsubParticipants();
      unsubEvents();
      unsubMessages();
    };
  }, [room.roomId, room.hostUid, userProfile.uid, igniteCrackerAt, pushToast, setCharacterTransientState, triggerLocalJoyVisuals]);

  // Merge Firestore live participants with transient animation overlays
  const renderedParticipants: CharacterData[] = participants.map((p) => {
    const anim = charAnimations[p.id];
    if (!anim) return p;
    return {
      ...p,
      state: anim.state ?? p.state,
      holdingSparkler: anim.holdingSparkler ?? p.holdingSparkler,
      xPercent: anim.xPercentOverride ?? p.xPercent,
      direction: anim.directionOverride ?? p.direction,
      speechBubble: anim.speechBubble !== undefined ? anim.speechBubble : p.speechBubble
    };
  });

  const activeBackground =
    BACKGROUND_OPTIONS.find((b) => b.id === localBgScene) || BACKGROUND_OPTIONS[0];

  const handleQuickIgniteSelected = useCallback(
    (type: CrackerType) => {
      const randomOffset = (Math.random() - 0.5) * 0.28;
      const x = (0.5 + randomOffset) * dimensions.width;
      const y = (0.7 + (Math.random() - 0.5) * 0.08) * dimensions.height;
      igniteCrackerAt(type, x, y, userProfile.uid, false);
    },
    [dimensions.width, dimensions.height, igniteCrackerAt, userProfile.uid]
  );

  // Unified touch + mouse pointer placement without accidental drag triggers
  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleStagePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!selectedCrackerForPlacement || activeTab !== 'terrace') return;
    if (pointerStartRef.current) {
      const dist = Math.hypot(e.clientX - pointerStartRef.current.x, e.clientY - pointerStartRef.current.y);
      pointerStartRef.current = null;
      if (dist > 16) return; // Ignore swipes/scroll gestures
    }

    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.max(24, Math.min(rect.width - 24, e.clientX - rect.left));
    const y = Math.max(110, Math.min(rect.height - 96, e.clientY - rect.top));

    igniteCrackerAt(selectedCrackerForPlacement, x, y, userProfile.uid, false);
  };

  const handleDropCrackerOnCharacter = (characterId: string, crackerTypeStr: string) => {
    const crackerType = crackerTypeStr as CrackerType;
    const char = renderedParticipants.find((c) => c.id === characterId);
    if (!char) return;

    const x = (char.xPercent / 100) * dimensions.width + (char.direction === 'right' ? 28 : -28);
    const y = (char.yPercent / 100) * dimensions.height;
    igniteCrackerAt(crackerType, x, y, userProfile.uid, false);
  };

  const handleFeedSweet = useCallback(
    (characterId: string, sweetType: SweetType) => {
      const sweetDef = SWEET_DEFINITIONS[sweetType];
      const targetFriend = participantsRef.current.find((c) => c.id === characterId);
      soundEngine.playSweetCheer();
      void broadcastSweetAction(
        room.roomId,
        userProfile,
        sweetType,
        sweetDef.name,
        targetFriend?.uid,
        targetFriend?.name
      );
      setCharacterTransientState(characterId, {
        state: 'sweets',
        speechBubble: {
          text: `Arey waah, ${sweetDef.name}! Happy Diwali! 🍬`,
          expiresAt: Date.now() + 4500
        }
      });
      recordPersonalCelebrationStep();
    },
    [room.roomId, userProfile, setCharacterTransientState, recordPersonalCelebrationStep]
  );

  const handleGrandFinale = () => {
    soundEngine.playHappyDiwaliBlast();
    const crackersToFire: CrackerType[] = ['charkhi', 'anar', 'rocket', 'skyshot', 'phooljhadi'];
    crackersToFire.forEach((type, idx) => {
      scheduleTimeout(() => {
        const dims = dimensionsRef.current;
        const x = (0.2 + idx * 0.15) * dims.width;
        const y = (0.71 + (idx % 2) * 0.06) * dims.height;
        igniteCrackerAt(type, x, y, userProfile.uid, false);
      }, idx * 340);
    });
  };

  const handleCrackerFinish = useCallback((id: string) => {
    setActiveCrackers((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const toggleAmbientMusic = () => {
    const nextState = !isMusicPlaying;
    soundEngine.toggleAmbientMusic(nextState);
    setIsMusicPlaying(nextState);
  };

  const handleSceneChange = (scene: BgSceneId) => {
    setLocalBgScene(scene);
    setBgError(false);
    if (isHost) {
      void updateRoomSceneOrWeather(room.roomId, { bgScene: scene });
    }
  };

  const handleWeatherChange = (mode: WeatherMode) => {
    setLocalWeatherMode(mode);
    if (isHost) {
      void updateRoomSceneOrWeather(room.roomId, { weatherMode: mode });
    }
  };

  const handleInteractWithFriend = (friend: CharacterData, action: 'wave' | 'sweet') => {
    soundEngine.playSweetCheer();
    if (action === 'sweet') {
      void broadcastSweetAction(room.roomId, userProfile, 'kaju_katli', 'Kaju Katli', friend.uid, friend.name);
      pushToast(`🍬 Sent Kaju Katli to ${friend.name}!`, 'sweet');
    } else {
      void broadcastWishOrDiyaOrInteract(
        room.roomId,
        userProfile,
        'interact',
        `Waved & wished Happy Diwali to ${friend.name}! ✨`,
        friend.uid
      );
      pushToast(`👋 Sent Happy Diwali wish to ${friend.name}!`, 'wish');
    }
    setSelectedFriendForAction(null);
  };

  const handleLogoutClick = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
    }
  };

  const shouldShowCharacters =
    activeTab === 'terrace' &&
    !isManagePeopleOpen &&
    !isGlobalStatsOpen &&
    !isAtmosphereModalOpen;

  return (
    <div
      ref={arenaRef}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={(e) => {
        e.preventDefault();
        const crackerType = e.dataTransfer.getData('application/cracker') as CrackerType;
        if (!crackerType) return;
        const rect = arenaRef.current?.getBoundingClientRect();
        if (!rect) return;
        igniteCrackerAt(crackerType, e.clientX - rect.left, e.clientY - rect.top, userProfile.uid, false);
      }}
      onPointerDown={handleStagePointerDown}
      onPointerUp={handleStagePointerUp}
      className={`relative w-full h-[100dvh] overflow-hidden select-none bg-black touch-none ${
        selectedCrackerForPlacement ? 'cursor-crosshair' : ''
      }`}
    >
      {/* Dynamic Starlit Celebration Scene Background (no full-screen CSS filter pass) */}
      <img
        key={activeBackground.id}
        src={bgError ? activeBackground.fallbackUrl : activeBackground.url || activeBackground.fallbackUrl}
        onError={() => setBgError(true)}
        alt={activeBackground.name}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-90 transition-opacity duration-500 pointer-events-none"
      />

      {/* Dynamic Starlit Night Sky (Stars, Meteors, Sky Lanterns, Distant Bursts) */}
      <DynamicWeatherSky
        weatherMode={localWeatherMode}
        width={dimensions.width}
        height={dimensions.height}
      />

      {/* Hanging Paper Lanterns */}
      <HangingLanterns />

      {/* Warm Ambient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/35 pointer-events-none z-20" />

      {/* High-Performance Floating Embers & Golden Dust Engine (Zero-GC SoA rAF) */}
      <AmbientEmbersCanvas
        width={dimensions.width}
        height={dimensions.height}
        paused={activeTab !== 'terrace' || isManagePeopleOpen || isGlobalStatsOpen}
        celebrationBoost={activeCrackers.length > 0}
      />

      {/* Dynamic Fireworks Particle Canvas */}
      <ParticleCanvas
        activeCrackers={activeCrackers}
        onCrackerFinish={handleCrackerFinish}
        width={dimensions.width}
        height={dimensions.height}
      />

      {/* Screen-Wide Multiplayer Confetti Explosion Layer */}
      <ConfettiCanvas
        width={dimensions.width}
        height={dimensions.height}
        burstSignal={joyBurstSignal}
      />

      {/* Non-blocking Share Joy / Milestone Banner */}
      {joyBanner && (
        <div
          aria-live="polite"
          className="fixed top-28 sm:top-24 left-1/2 -translate-x-1/2 z-[45] pointer-events-none px-4 w-full max-w-md flex justify-center"
        >
          <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-fuchsia-950/95 via-amber-950/95 to-pink-950/95 border border-amber-300/70 shadow-[0_8px_32px_rgba(236,72,153,0.4)] flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-100 animate-in fade-in zoom-in-95 duration-200">
            <PartyPopper className="w-4 h-4 text-yellow-300 shrink-0" />
            <span className="truncate">{joyBanner}</span>
          </div>
        </div>
      )}

      {/* Responsive 2-Tier Header Navigation */}
      <header
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        className="relative z-40 bg-zinc-950/95 sm:backdrop-blur-md border-b border-amber-500/25 shadow-xl select-none"
      >
        {/* Offline Warning Strip */}
        {!isOnlineNetwork && (
          <div className="bg-amber-500/20 border-b border-amber-500/40 px-3 py-1 flex items-center justify-center gap-2 text-[11px] font-semibold text-amber-200">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>You appear offline — reconnecting automatically when signal returns.</span>
          </div>
        )}

        {/* Tier 1: Brand, Scene Switcher, Live Badge, Audio & Account */}
        <div className="px-2.5 sm:px-5 py-1.5 sm:py-2 flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-white font-festive truncate">
                DIWALI CELEBRATION
              </span>
              <span className="text-[10px] text-amber-400/80 hidden md:inline -mt-0.5 truncate">
                {room.title}
              </span>
            </div>
          </div>

          {/* Scene Selector */}
          <div className="order-3 sm:order-2 w-full sm:w-auto flex items-center justify-center bg-zinc-900/90 border border-amber-500/35 rounded-xl p-0.5 shadow-inner overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => handleSceneChange('courtyard')}
              className={`min-h-[36px] flex-1 sm:flex-initial px-2.5 py-1 text-[11px] sm:text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                localBgScene === 'courtyard'
                  ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-400/50'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Starlit Courtyard (दीप आँगन)"
            >
              <span>🏮</span>
              <span>Courtyard</span>
            </button>
            <button
              type="button"
              onClick={() => handleSceneChange('playground')}
              className={`min-h-[36px] flex-1 sm:flex-initial px-2.5 py-1 text-[11px] sm:text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                localBgScene === 'playground'
                  ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-400/50'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Celebration Ground (उत्सव मैदान)"
            >
              <span>🎪</span>
              <span>Ground</span>
            </button>
            <button
              type="button"
              onClick={() => handleSceneChange('terrace')}
              className={`min-h-[36px] flex-1 sm:flex-initial px-2.5 py-1 text-[11px] sm:text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                localBgScene === 'terrace'
                  ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-400/50'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Rooftop Terrace (शांत छत)"
            >
              <span>🪔</span>
              <span>Terrace</span>
            </button>
          </div>

          {/* Right Controls: Live Online Badge, Audio, User Profile & Logout */}
          <div className="order-2 sm:order-3 flex items-center gap-1.5 shrink-0">
            <GlobalCelebrationBadge
              onlineCount={participants.length}
              room={room}
              latestActivity={latestActivity}
              onClick={() => setIsGlobalStatsOpen(true)}
            />

            <button
              type="button"
              onClick={toggleAmbientMusic}
              className={`min-h-[40px] min-w-[40px] px-2 sm:px-2.5 text-xs font-medium rounded-xl border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                isMusicPlaying
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/60'
                  : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
              title="Toggle Sitar Festive Music"
            >
              <Music className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline">{isMusicPlaying ? 'Sitar ON' : 'Sitar'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-300 hover:text-white bg-zinc-900/90 border border-zinc-800 rounded-xl transition-colors cursor-pointer"
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* User Avatar chip (opens My Look & Dress) */}
            <button
              type="button"
              onClick={() => {
                setManagePeopleSubTab('customize');
                setIsManagePeopleOpen(true);
              }}
              title="Edit my avatar, DP, and festive dress"
              className="min-h-[40px] pl-1 pr-2 py-1 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 flex items-center gap-1.5 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-400/60 shrink-0">
                <AvatarImage
                  src={userProfile.photoURL}
                  name={userProfile.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="hidden xl:inline text-xs font-semibold text-zinc-200 max-w-[90px] truncate">
                {userProfile.displayName}
              </span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={() => void handleLogoutClick()}
              disabled={loggingOut}
              title="Log out of Google account"
              className="min-h-[40px] min-w-[40px] px-2 sm:px-2.5 rounded-xl bg-zinc-900/90 hover:bg-rose-500/20 border border-zinc-800 hover:border-rose-500/50 text-zinc-300 hover:text-rose-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Log Out</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Universal Features Ribbon (All features accessible across 320px mobile & desktop) */}
        <div className="bg-zinc-900/95 border-t border-zinc-800/80 px-2 sm:px-4 py-1">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none justify-start lg:justify-center">
            <button
              type="button"
              onClick={() => setActiveTab('terrace')}
              className={`min-h-[38px] px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'terrace'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Fireworks</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mithai')}
              className={`min-h-[38px] px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'mithai'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>Mithai ({room.sweetsShared})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('weather')}
              className={`min-h-[38px] px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'weather'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              <Stars className="w-3.5 h-3.5 text-amber-400" />
              <span>Night Sky</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setChatRecipientHint(null);
                setIsChatOpen((prev) => !prev);
              }}
              aria-expanded={isChatOpen}
              className={`min-h-[38px] px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                isChatOpen
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50'
                  : 'text-zinc-200 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/70'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Chat</span>
              {unreadChatCount > 0 && !isChatOpen && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-400 text-black rounded-full tabular-nums">
                  {unreadChatCount > 99 ? '99+' : unreadChatCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setManagePeopleSubTab('people');
                setIsManagePeopleOpen(true);
              }}
              className="min-h-[38px] px-3 py-1 text-xs font-semibold rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Friends ({participants.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setManagePeopleSubTab('customize');
                setIsManagePeopleOpen(true);
              }}
              className="min-h-[38px] px-3 py-1 text-xs font-semibold rounded-lg text-zinc-200 hover:text-white hover:bg-zinc-800/80 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Shirt className="w-3.5 h-3.5 text-amber-400" />
              <span>Wardrobe</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setManagePeopleSubTab('invite');
                setIsManagePeopleOpen(true);
              }}
              className="min-h-[38px] px-3 py-1 text-xs font-bold rounded-lg text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Invite Link</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAtmosphereModalOpen(true)}
              className="min-h-[38px] px-3 py-1 text-xs font-semibold rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Ambience</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`min-h-[38px] px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Traditions</span>
            </button>

            <button
              type="button"
              disabled={shareJoyCooldown}
              onClick={() => void handleShareJoy()}
              className="min-h-[38px] px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-fuchsia-600/80 via-pink-500/80 to-amber-500/80 hover:from-fuchsia-500 hover:to-amber-400 disabled:opacity-65 border border-pink-300/50 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
            >
              <PartyPopper className="w-3.5 h-3.5 text-yellow-200" />
              <span>Share Joy</span>
            </button>

            {onReplayGreeting && (
              <button
                type="button"
                onClick={onReplayGreeting}
                className="min-h-[38px] px-3 py-1 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Greeting</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Live Join / Leave / Activity Toast Notifications */}
      <div
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className={`fixed top-28 sm:top-24 z-40 flex flex-col gap-2 max-w-[calc(100vw-1rem)] sm:max-w-xs pointer-events-none ${
          isChatOpen ? 'right-2 sm:left-4 sm:right-auto' : 'right-2 sm:right-4'
        }`}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-3.5 py-2 rounded-2xl border backdrop-blur-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200 ${
              toast.kind === 'join'
                ? 'bg-emerald-950/90 border-emerald-400/60 text-emerald-100'
                : toast.kind === 'leave'
                ? 'bg-zinc-950/90 border-zinc-700 text-zinc-300'
                : 'bg-zinc-950/92 border-amber-400/60 text-amber-100'
            }`}
          >
            <span className="truncate">{toast.text}</span>
          </div>
        ))}
      </div>

      {/* Friend Quick-Interaction Popover (when tapping a friend in the arena) */}
      {selectedFriendForAction && activeTab === 'terrace' && (
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md p-3 rounded-2xl bg-zinc-950/96 border border-amber-400/60 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-400 shrink-0">
              <AvatarImage
                src={selectedFriendForAction.avatarUrl}
                name={selectedFriendForAction.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{selectedFriendForAction.name}</div>
              <div className="text-[10px] text-amber-300/80 truncate">{selectedFriendForAction.relation}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setChatRecipientHint({
                  uid: selectedFriendForAction.uid || selectedFriendForAction.id,
                  name: selectedFriendForAction.name
                });
                setIsChatOpen(true);
                setSelectedFriendForAction(null);
              }}
              className="min-h-[38px] px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>
            <button
              type="button"
              onClick={() => handleInteractWithFriend(selectedFriendForAction, 'wave')}
              className="min-h-[38px] px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold cursor-pointer"
            >
              👋 Wish
            </button>
            <button
              type="button"
              onClick={() => handleInteractWithFriend(selectedFriendForAction, 'sweet')}
              className="min-h-[38px] px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-xs font-semibold cursor-pointer"
            >
              🍬 Mithai
            </button>
            <button
              type="button"
              onClick={() => {
                const fx = (selectedFriendForAction.xPercent / 100) * dimensions.width;
                const fy = (selectedFriendForAction.yPercent / 100) * dimensions.height;
                igniteCrackerAt('anar', fx, fy, userProfile.uid, false);
                setSelectedFriendForAction(null);
              }}
              className="min-h-[38px] px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/50 text-rose-200 text-xs font-semibold cursor-pointer"
            >
              🎆 Light Anar
            </button>
            <button
              type="button"
              onClick={() => setSelectedFriendForAction(null)}
              aria-label="Close friend interaction"
              className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Real Online Friends Layer */}
      {shouldShowCharacters && (
        <div className="absolute inset-0 pointer-events-auto z-30">
          {renderedParticipants.map((char) => (
            <Character
              key={char.id}
              character={char}
              onDropCracker={handleDropCrackerOnCharacter}
              onDropSweet={handleFeedSweet}
              onClick={(charId) => {
                const tapped = renderedParticipants.find((p) => p.id === charId);
                if (!tapped) return;
                if (selectedCrackerForPlacement) {
                  handleDropCrackerOnCharacter(charId, selectedCrackerForPlacement);
                } else if (tapped.isCurrentUser) {
                  setManagePeopleSubTab('customize');
                  setIsManagePeopleOpen(true);
                } else {
                  setSelectedFriendForAction(tapped);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Bottom Fireworks Dock + Integrated Soundboard & Chat Trigger */}
      {activeTab === 'terrace' && (
        <InventoryDock
          selectedCracker={selectedCrackerForPlacement}
          onSelectCracker={(type) => setSelectedCrackerForPlacement(type)}
          onQuickIgniteSelected={handleQuickIgniteSelected}
          onOpenSweetsBox={() => setActiveTab('mithai')}
          onTriggerGrandFinale={handleGrandFinale}
          isSoundboardOpen={isSoundboardOpen}
          onToggleSoundboard={() => setIsSoundboardOpen((prev) => !prev)}
          isChatOpen={isChatOpen}
          onToggleChat={() => {
            setChatRecipientHint(null);
            setIsChatOpen((prev) => !prev);
          }}
          unreadChatCount={unreadChatCount}
          onShareJoy={() => void handleShareJoy()}
          shareJoyCooldown={shareJoyCooldown}
          soundboardSlot={
            <CrackerSoundboard
              isOpen={isSoundboardOpen}
              onClose={() => setIsSoundboardOpen(false)}
              isMuted={isMuted}
              onToggleMute={onToggleMute}
              onTriggerPad={(type, withVisuals) => {
                if (withVisuals) {
                  const spreadX = (0.28 + Math.random() * 0.44) * dimensions.width;
                  const groundY = (0.68 + Math.random() * 0.1) * dimensions.height;
                  igniteCrackerAt(type, spreadX, groundY, userProfile.uid, false, true);
                } else {
                  triggerCrackerAudio(type);
                }
              }}
            />
          }
        />
      )}

      {/* Sweets Box Modal */}
      <SweetsBoxModal
        isOpen={activeTab === 'mithai'}
        onClose={() => setActiveTab('terrace')}
        onShareSweet={(sweetType) => {
          const sweetDef = SWEET_DEFINITIONS[sweetType];
          soundEngine.playSweetCheer();
          void broadcastSweetAction(room.roomId, userProfile, sweetType, sweetDef.name);
        }}
        characters={renderedParticipants}
        sweetsDistributedCount={room.sweetsShared}
      />

      {/* Live Celebration Feed & Activity Modal */}
      <GlobalCelebrationModal
        isOpen={isGlobalStatsOpen}
        onClose={() => setIsGlobalStatsOpen(false)}
        room={room}
        onlineCount={participants.length}
        activities={activities}
        userName={userProfile.displayName}
        onSendWish={async (wishText) => {
          await broadcastWishOrDiyaOrInteract(room.roomId, userProfile, 'wish', wishText);
          recordPersonalCelebrationStep();
        }}
        onLightDiya={async () => {
          await broadcastWishOrDiyaOrInteract(
            room.roomId,
            userProfile,
            'diya',
            `${userProfile.displayName} lit a warm clay diya in the courtyard!`
          );
          recordPersonalCelebrationStep();
        }}
      />

      {/* Online Friends, Invite Link & My Outfit Modal */}
      <ManageCharactersModal
        isOpen={isManagePeopleOpen}
        onClose={() => setIsManagePeopleOpen(false)}
        participants={renderedParticipants}
        currentUserUid={userProfile.uid}
        userProfile={userProfile}
        googlePhotoUrl={googlePhotoUrl}
        room={room}
        initialSubTab={managePeopleSubTab}
        onSaveMyLook={onSaveProfile}
        onInteractWithFriend={handleInteractWithFriend}
        onJoinByInviteCode={onJoinRoomByCode}
      />

      {/* Ambience Volume Mixer Modal */}
      <AtmosphereControlsModal
        isOpen={isAtmosphereModalOpen}
        onClose={() => setIsAtmosphereModalOpen(false)}
      />

      {/* Real-Time Room Chat & Festive Greetings Panel */}
      <RoomChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        participants={renderedParticipants}
        currentUser={userProfile}
        hostUid={room.hostUid}
        initialRecipient={chatRecipientHint}
        onSendMessage={async (text, kind, recipient) => {
          await sendRoomMessage(room.roomId, userProfile, text, kind, recipient);
        }}
        onDeleteMessage={async (messageId) => {
          await deleteRoomMessage(room.roomId, messageId);
        }}
      />

      {/* Night Sky & Atmosphere Modal */}
      {activeTab === 'weather' && (
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-zinc-950/95 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Stars className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-bold text-white font-festive">
                  Night Sky &amp; Atmosphere
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('terrace')}
                className="min-h-[36px] px-2.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Customize the festive Diwali night sky with twinkling stars, ascending sky lanterns, golden evening mist, and distant horizon fireworks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleWeatherChange('starlit')}
                className={`min-h-[72px] p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  localWeatherMode === 'starlit'
                    ? 'border-amber-400 bg-amber-500/15 text-white'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold text-amber-300">Starlit Night</span>
                <span className="text-[11px]">Clear starry night sky with meteors and lantern glow</span>
              </button>

              <button
                type="button"
                onClick={() => handleWeatherChange('lanterns')}
                className={`min-h-[72px] p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  localWeatherMode === 'lanterns'
                    ? 'border-amber-400 bg-amber-500/15 text-white'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold text-amber-300">Sky Lanterns</span>
                <span className="text-[11px]">Warm floating paper lanterns ascending into the night</span>
              </button>

              <button
                type="button"
                onClick={() => handleWeatherChange('mist')}
                className={`min-h-[72px] p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  localWeatherMode === 'mist'
                    ? 'border-amber-400 bg-amber-500/15 text-white'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold text-amber-300">Autumn Mist</span>
                <span className="text-[11px]">Soft golden courtyard haze with warm lantern ambience</span>
              </button>

              <button
                type="button"
                onClick={() => handleWeatherChange('distant_fireworks')}
                className={`min-h-[72px] p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  localWeatherMode === 'distant_fireworks'
                    ? 'border-amber-400 bg-amber-500/15 text-white'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold text-amber-300">City Skyline Bursts</span>
                <span className="text-[11px]">Distant celebratory fireworks across far horizons</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('terrace')}
              className="w-full min-h-[44px] py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Return to Celebration Arena
            </button>
          </div>
        </div>
      )}

      {/* Traditions & Safety Guide Modal */}
      {activeTab === 'guide' && (
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white font-festive">
                Diwali Crackers &amp; Festive Customs
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('terrace')}
                className="min-h-[36px] px-2.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <p>
                Diwali evening brings friends and families together on courtyards and rooftops, lighting clay diyas, crafting rangolis, sharing Kaju Katli and Ladoos, and igniting traditional fireworks safely.
              </p>
              <div className="space-y-2 pt-1">
                {Object.values(CRACKER_DEFINITIONS).map((c) => (
                  <div key={c.type} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col gap-1">
                    <div className="flex items-center justify-between font-semibold text-amber-300 gap-2">
                      <span>
                        {c.name} ({c.hindiName}) · {c.subtitle}
                      </span>
                      <span className="text-[10px] text-zinc-400 shrink-0">{c.durationSeconds}s</span>
                    </div>
                    <p className="text-zinc-400 text-[11px]">{c.description}</p>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>{c.safetyTip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
