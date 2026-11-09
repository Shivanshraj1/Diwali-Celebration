import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CharacterData, CrackerType, ActiveCracker, SweetType, GlobalCelebrationStats, CelebrationActivity } from '../types';
import { INITIAL_CHARACTERS, CRACKER_DEFINITIONS, BACKGROUND_OPTIONS, SWEET_DEFINITIONS } from '../data/constants';
import { Character } from './Character';
import { ParticleCanvas } from './ParticleCanvas';
import { InventoryDock } from './InventoryDock';
import { SweetsBoxModal } from './SweetsBoxModal';
import { DynamicWeatherSky, WeatherMode } from './DynamicWeatherSky';
import { ManageCharactersModal } from './ManageCharactersModal';
import { HangingLanterns } from './HangingLanterns';
import { GlobalCelebrationBadge } from './GlobalCelebrationBadge';
import { GlobalCelebrationModal } from './GlobalCelebrationModal';
import { realtimeCelebration } from '../services/realtimeCelebration';
import { soundEngine } from '../audio/soundEngine';
import {
  Volume2,
  VolumeX,
  Music,
  Info,
  Sparkles,
  Flame,
  CheckCircle2,
  Users,
  Moon,
  Gift,
  Image as ImageIcon
} from 'lucide-react';

export type ArenaTab = 'terrace' | 'mithai' | 'guide' | 'weather';

interface CrackerArenaProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onReplayGreeting?: () => void;
}

export const CrackerArena: React.FC<CrackerArenaProps> = ({
  isMuted,
  onToggleMute,
  onReplayGreeting
}) => {
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [characters, setCharacters] = useState<CharacterData[]>(INITIAL_CHARACTERS);
  const [activeCrackers, setActiveCrackers] = useState<ActiveCracker[]>([]);
  const [activeTab, setActiveTab] = useState<ArenaTab>('terrace');
  const [currentBgId, setCurrentBgId] = useState<'playground' | 'terrace'>('playground');
  const [sweetsDistributedCount, setSweetsDistributedCount] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [selectedCrackerForPlacement, setSelectedCrackerForPlacement] = useState<CrackerType | null>(null);
  const [weatherMode, setWeatherMode] = useState<WeatherMode>('starlit');
  const [isManagePeopleOpen, setIsManagePeopleOpen] = useState(false);
  const [isGlobalStatsOpen, setIsGlobalStatsOpen] = useState(false);
  const [celebrationStats, setCelebrationStats] = useState<GlobalCelebrationStats>(realtimeCelebration.getState());
  const [latestActivity, setLatestActivity] = useState<CelebrationActivity | undefined>();

  const activeBackground = BACKGROUND_OPTIONS.find((b) => b.id === currentBgId) || BACKGROUND_OPTIONS[0];

  // Subscribe to live global celebration count
  useEffect(() => {
    const unsub = realtimeCelebration.subscribe((stats, act) => {
      setCelebrationStats(stats);
      if (act) setLatestActivity(act);
    });
    return unsub;
  }, []);

  // Resize listener
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

  // Autonomous stroll & authentic ambient terrace chatter
  useEffect(() => {
    if (activeTab !== 'terrace') return;

    const wanderInterval = setInterval(() => {
      setCharacters((prev) =>
        prev.map((char) => {
          if (char.state !== 'idle') return char;

          // 25% chance to stroll slightly on the terrace
          if (Math.random() < 0.25) {
            const deltaX = (Math.random() - 0.5) * 10;
            const newX = Math.max(14, Math.min(86, char.xPercent + deltaX));
            return {
              ...char,
              xPercent: newX,
              direction: deltaX > 0 ? 'right' : 'left',
              state: 'walking'
            };
          }

          // 18% chance for authentic Hindi terrace dialogue
          if (Math.random() < 0.18 && !char.speechBubble) {
            const dialogue = [
              'Shubh Deepavali! Look at that glowing moon!',
              'Arey Anar lagao na koi yahan pe!',
              'Yahan se poora shehar chamak raha hai!',
              'Mithai dabba pass karna koi!',
              'Sambhal ke chalna, rangoli ke paas diya hai.',
              'Happy Diwali! Kya khubsurat aatishbaazi hai!'
            ];
            return {
              ...char,
              speechBubble: {
                text: dialogue[Math.floor(Math.random() * dialogue.length)],
                expiresAt: Date.now() + 4000
              }
            };
          }

          return char;
        })
      );
    }, 3600);

    return () => clearInterval(wanderInterval);
  }, [activeTab]);

  // Return walking characters back to idle
  useEffect(() => {
    const resetWalking = setInterval(() => {
      setCharacters((prev) =>
        prev.map((char) => {
          if (char.state === 'walking') {
            return { ...char, state: 'idle' };
          }
          if (char.speechBubble && Date.now() > char.speechBubble.expiresAt) {
            return { ...char, speechBubble: null };
          }
          return char;
        })
      );
    }, 1200);

    return () => clearInterval(resetWalking);
  }, []);

  // Cracker audio triggers
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
        soundEngine.playRocketSound(1.3);
        break;
      case 'skyshot':
        soundEngine.playSkyshotSound(7);
        break;
      case 'sky_letters':
        soundEngine.playRocketSound(1.4);
        setTimeout(() => {
          soundEngine.playHappyDiwaliBlast();
        }, 1100);
        break;
    }
  }, []);

  // Realistic human ignition choreography
  const igniteCrackerAt = useCallback(
    (type: CrackerType, x: number, y: number, characterId?: string) => {
      const def = CRACKER_DEFINITIONS[type];
      const now = performance.now();
      const fuseDuration = 1000;
      const totalDuration = def.durationSeconds * 1000 + fuseDuration;

      soundEngine.playFuseSizzle(1.0);

      // Report to global live celebration counter
      const igniterName = characterId ? characters.find((c) => c.id === characterId)?.name : 'Celebrator';
      realtimeCelebration.reportAction('cracker', `Ignited ${def.name} (${def.hindiName})!`, igniterName);

      setTimeout(() => {
        triggerCrackerAudio(type);
      }, fuseDuration);

      const newCracker: ActiveCracker = {
        id: `cracker_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        type,
        x,
        y,
        ignitedByCharacterId: characterId,
        stage: 'fusing',
        startTime: now,
        fuseEndTime: now + fuseDuration,
        endTime: now + totalDuration,
        colorScheme: def.sparkColors
      };

      setActiveCrackers((prev) => [...prev, newCracker]);

      if (characterId) {
        const crackerXPercent = (x / Math.max(1, dimensions.width)) * 100;
        const sideStepOffset = crackerXPercent > 50 ? -20 : 20;
        const safeSideX = Math.max(10, Math.min(90, crackerXPercent + sideStepOffset));

        // 1. Deep knee crouch with agarbatti stick touching fuse right next to cracker
        setCharacters((prev) =>
          prev.map((c) => {
            if (c.id === characterId) {
              return {
                ...c,
                xPercent: Math.max(8, Math.min(92, crackerXPercent + (crackerXPercent > 50 ? 5 : -5))),
                direction: crackerXPercent > 50 ? 'left' : 'right',
                state: 'igniting',
                holdingSparkler: type === 'phooljhadi',
                speechBubble: {
                  text: `Dekho, bati pe laga raha hoon... Sambhal ke!`,
                  expiresAt: Date.now() + 2500
                }
              };
            }
            return c;
          })
        );

        // 2. "Bhaag Bhaag!" - Person keeps well aside so viewing audience has completely unobstructed view!
        setTimeout(() => {
          setCharacters((prev) =>
            prev.map((c) => {
              if (c.id === characterId) {
                return {
                  ...c,
                  xPercent: safeSideX,
                  direction: safeSideX < crackerXPercent ? 'right' : 'left', // Faces the cracker from the side
                  state: 'running_back',
                  speechBubble: {
                    text: `Bhaag bhaag! Jal gaya!`,
                    expiresAt: Date.now() + 2000
                  }
                };
              }
              // Also move other nearby characters aside to clear the viewing corridor
              if (Math.abs(c.xPercent - crackerXPercent) < 16) {
                const clearDir = c.xPercent > crackerXPercent ? 12 : -12;
                return {
                  ...c,
                  xPercent: Math.max(10, Math.min(90, c.xPercent + clearDir)),
                  direction: c.xPercent < crackerXPercent ? 'right' : 'left',
                  speechBubble: {
                    text: `Peeche hat jao!`,
                    expiresAt: Date.now() + 2500
                  }
                };
              }
              return c;
            })
          );
        }, 750);

        // 3. Hands over ears in anticipation from safe side position
        setTimeout(() => {
          setCharacters((prev) =>
            prev.map((c) => {
              if (c.id === characterId) {
                return {
                  ...c,
                  state: type === 'phooljhadi' ? 'celebrating' : 'covering_ears',
                  speechBubble: {
                    text: `Wah! Look at that flame!`,
                    expiresAt: Date.now() + 3000
                  }
                };
              }
              return c;
            })
          );
        }, 1250);

        // 4. Drop hands, jump, and celebrate with clapping from the side
        setTimeout(() => {
          setCharacters((prev) =>
            prev.map((c) => {
              if (c.id === characterId) {
                return {
                  ...c,
                  state: 'celebrating',
                  holdingSparkler: false,
                  speechBubble: {
                    text: `Maza aa gaya! Kya zabardast phoota!`,
                    expiresAt: Date.now() + 3500
                  }
                };
              }
              return c;
            })
          );
        }, fuseDuration + 1400);

        // 5. Return to idle
        setTimeout(() => {
          setCharacters((prev) =>
            prev.map((c) => {
              if (c.id === characterId) {
                return { ...c, state: 'idle', speechBubble: null };
              }
              return c;
            })
          );
        }, totalDuration);
      }
    },
    [triggerCrackerAudio]
  );

  const handleDropCrackerOnCharacter = (characterId: string, crackerTypeStr: string) => {
    const crackerType = crackerTypeStr as CrackerType;
    const char = characters.find((c) => c.id === characterId);
    if (!char) return;

    const x = (char.xPercent / 100) * dimensions.width + (char.direction === 'right' ? 30 : -30);
    const y = (char.yPercent / 100) * dimensions.height;

    igniteCrackerAt(crackerType, x, y, characterId);
  };

  const handleFeedSweet = (characterId: string, sweetType: SweetType) => {
    const sweetDef = SWEET_DEFINITIONS[sweetType];
    soundEngine.playSweetCheer();

    setSweetsDistributedCount((prev) => prev + 1);

    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id === characterId) {
          return {
            ...c,
            state: 'sweets',
            happiness: Math.min(100, c.happiness + 5),
            speechBubble: {
              text: `Arey waah, ${sweetDef.name}! Happy Diwali!`,
              expiresAt: Date.now() + 4500
            }
          };
        }
        return c;
      })
    );

    setTimeout(() => {
      setCharacters((prev) =>
        prev.map((c) => (c.id === characterId && c.state === 'sweets' ? { ...c, state: 'idle' } : c))
      );
    }, 4500);
  };

  const handleFloorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedCrackerForPlacement) return;

    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let nearestChar = characters[0];
    let minDist = Infinity;
    characters.forEach((char) => {
      const charPxX = (char.xPercent / 100) * dimensions.width;
      const charPxY = (char.yPercent / 100) * dimensions.height;
      const dist = Math.hypot(charPxX - x, charPxY - y);
      if (dist < minDist) {
        minDist = dist;
        nearestChar = char;
      }
    });

    igniteCrackerAt(selectedCrackerForPlacement, x, y, nearestChar.id);
    setSelectedCrackerForPlacement(null);
  };

  const handleArenaDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleArenaDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const crackerType = e.dataTransfer.getData('application/cracker') as CrackerType;
    if (!crackerType) return;

    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    igniteCrackerAt(crackerType, x, y);
  };

  const handleGrandFinale = () => {
    soundEngine.playHappyDiwaliBlast();

    const crackersToFire: CrackerType[] = ['charkhi', 'anar', 'rocket', 'skyshot', 'phooljhadi'];
    crackersToFire.forEach((type, idx) => {
      setTimeout(() => {
        const x = (0.22 + idx * 0.14) * dimensions.width;
        const y = (0.72 + (idx % 2) * 0.06) * dimensions.height;
        const char = characters[idx % characters.length];
        igniteCrackerAt(type, x, y, char.id);
      }, idx * 350);
    });
  };

  const handleCrackerFinish = (id: string) => {
    setActiveCrackers((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleAmbientMusic = () => {
    const nextState = !isMusicPlaying;
    soundEngine.toggleAmbientMusic(nextState);
    setIsMusicPlaying(nextState);
  };

  // Add / Edit / Remove character handlers
  const handleUpdateCharacter = (id: string, newName: string, newRelation: string, newAvatarUrl?: string) => {
    setCharacters((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              name: newName,
              relation: newRelation,
              ...(newAvatarUrl ? { avatarUrl: newAvatarUrl } : {})
            }
          : c
      )
    );
  };

  const handleAddCharacter = (newChar: CharacterData) => {
    setCharacters((prev) => [...prev, newChar]);
  };

  const handleRemoveCharacter = (id: string) => {
    if (characters.length > 1) {
      setCharacters((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Check if characters should be visible (strictly only when on fireworks arena view with no modals open)
  const shouldShowCharacters = activeTab === 'terrace' && !isManagePeopleOpen && !isGlobalStatsOpen;

  return (
    <div
      ref={arenaRef}
      onDragOver={handleArenaDragOver}
      onDrop={handleArenaDrop}
      onClick={handleFloorClick}
      className="relative w-screen h-screen overflow-hidden select-none bg-black"
    >
      {/* Dynamic Celebration Scene Background (Playground vs Terrace) */}
      <img
        key={activeBackground.id}
        src={activeBackground.url}
        alt={activeBackground.name}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.04] transition-opacity duration-700 animate-in fade-in"
      />

      {/* Dynamic Night Weather Sky (Glowing Moon, Twinkling Stars, Shooting Stars, Sky Lanterns) */}
      <DynamicWeatherSky
        weatherMode={weatherMode}
        width={dimensions.width}
        height={dimensions.height}
      />

      {/* Animated Glowing Paper Lanterns Hanging from Top */}
      <HangingLanterns />

      {/* Warm Ambient Shading */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none z-20" />

      {/* Dynamic Particle Canvas Engine */}
      <ParticleCanvas
        activeCrackers={activeCrackers}
        onCrackerFinish={handleCrackerFinish}
        width={dimensions.width}
        height={dimensions.height}
      />

      {/* Top Header Navigation */}
      <header className="relative z-40 flex items-center justify-between gap-8 px-6 py-4 bg-zinc-950/75 backdrop-blur-md border-b border-amber-500/20">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          </div>
          <span className="text-base font-bold tracking-tight text-white font-festive whitespace-nowrap shrink-0">
            DIWALI CELEBRATION
          </span>
        </div>

        {/* Zone 2: Primary Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-300">
          <button
            onClick={() => setActiveTab('terrace')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'terrace' ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            <span>Fireworks Arena</span>
          </button>

          <button
            onClick={() => setActiveTab('mithai')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'mithai' ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Mithai Dabba ({sweetsDistributedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('weather')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'weather' ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Night Sky &amp; Moon</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'guide' ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Traditions</span>
          </button>

          {onReplayGreeting && (
            <button
              onClick={onReplayGreeting}
              className="text-zinc-400 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
              title="Watch 3-2-1 Countdown &amp; Happy Diwali Greeting Animation"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Diwali Greeting</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Global Live Counter, Scene Selector, People & Audio Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Live Global Celebration Counter Badge */}
          <GlobalCelebrationBadge
            stats={celebrationStats}
            latestActivity={latestActivity}
            onClick={() => setIsGlobalStatsOpen(true)}
          />

          {/* Scene Switcher: Playground / Terrace */}
          <div className="flex items-center bg-zinc-900/90 border border-amber-500/30 rounded-lg p-0.5 shadow-sm">
            <button
              onClick={() => setCurrentBgId('playground')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                currentBgId === 'playground'
                  ? 'bg-amber-500/25 text-amber-300 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Festival Community Ground full of lights and celebration"
            >
              Playground
            </button>
            <button
              onClick={() => setCurrentBgId('terrace')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                currentBgId === 'terrace'
                  ? 'bg-amber-500/25 text-amber-300 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Calm Rooftop Terrace with clay diyas overlooking city"
            >
              Terrace
            </button>
          </div>

          <button
            onClick={() => setIsManagePeopleOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/40 rounded-lg transition-colors"
            title="Add, Rename, or Invite People to Celebration"
          >
            <Users className="w-3.5 h-3.5" />
            <span>People ({characters.length})</span>
          </button>

          <button
            onClick={toggleAmbientMusic}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isMusicPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-md'
                : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
            title="Toggle Indian Sitar &amp; Tanpura Ambient Music"
          >
            <Music className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isMusicPlaying ? 'Sitar ON' : 'Festive Sitar'}</span>
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 text-zinc-300 hover:text-white bg-zinc-900/90 border border-zinc-800 rounded-lg transition-colors"
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* Minimal Floating Cracker Placement Suggestion */}
      {selectedCrackerForPlacement && activeTab === 'terrace' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 bg-zinc-950/92 backdrop-blur-xl border border-amber-500/40 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>
          <span className="text-xs font-semibold text-amber-200 whitespace-nowrap">
            Tap to place {CRACKER_DEFINITIONS[selectedCrackerForPlacement].name}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCrackerForPlacement(null);
            }}
            className="px-2 py-0.5 text-[11px] font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-full border border-zinc-800 shrink-0 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Animated Characters on the Terrace (HIDDEN in other tabs like mithai, guide, weather) */}
      {shouldShowCharacters && (
        <div className="absolute inset-0 pointer-events-auto">
          {characters.map((char) => (
            <Character
              key={char.id}
              character={char}
              onDropCracker={handleDropCrackerOnCharacter}
              onDropSweet={handleFeedSweet}
              onClick={(charId) => {
                if (selectedCrackerForPlacement) {
                  handleDropCrackerOnCharacter(charId, selectedCrackerForPlacement);
                  setSelectedCrackerForPlacement(null);
                } else {
                  // Direct edit character on click!
                  setIsManagePeopleOpen(true);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Bottom Inventory Dock (Visible on terrace view) */}
      {activeTab === 'terrace' && (
        <InventoryDock
          onSelectCracker={(type) => setSelectedCrackerForPlacement(type)}
          onOpenSweetsBox={() => setActiveTab('mithai')}
          onTriggerGrandFinale={handleGrandFinale}
        />
      )}

      {/* Sweets Box Tab / Modal (With full character thank you gratitude) */}
      <SweetsBoxModal
        isOpen={activeTab === 'mithai'}
        onClose={() => setActiveTab('terrace')}
        onShareSweet={(sweetType) => {
          soundEngine.playSweetCheer();
          const sweetDef = SWEET_DEFINITIONS[sweetType];
          setSweetsDistributedCount((prev) => prev + 1);
          realtimeCelebration.reportAction('sweet', `Shared sweet ${sweetDef.name} with everyone!`, 'Celebrator');

          const thankYouMessages = [
            `Dhanyawad! Bohot swadisht ${sweetDef.name} thi! 🙏`,
            `Thank you so much! Happy Diwali to your whole family! ✨`,
            `Wah! Maza aa gaya, shukriya mere bhai! 🍬`,
            `Arey waah, thank you for sharing the sweet love! 🪔`
          ];

          setCharacters((prev) =>
            prev.map((c, idx) => ({
              ...c,
              state: 'celebrating',
              happiness: Math.min(100, c.happiness + 15),
              speechBubble: {
                text: thankYouMessages[idx % thankYouMessages.length],
                expiresAt: Date.now() + 7000
              }
            }))
          );
        }}
        characters={characters}
        sweetsDistributedCount={sweetsDistributedCount}
      />

      {/* Global Live Celebration Stats & Feed Modal */}
      <GlobalCelebrationModal
        isOpen={isGlobalStatsOpen}
        onClose={() => setIsGlobalStatsOpen(false)}
        stats={celebrationStats}
      />

      {/* Manage Characters Modal (Add, Edit Names, Remove) */}
      <ManageCharactersModal
        isOpen={isManagePeopleOpen}
        onClose={() => setIsManagePeopleOpen(false)}
        characters={characters}
        onUpdateCharacter={handleUpdateCharacter}
        onAddCharacter={handleAddCharacter}
        onRemoveCharacter={handleRemoveCharacter}
      />

      {/* Night Sky & Weather Tab View */}
      {activeTab === 'weather' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950/95 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-bold text-white font-festive">
                  Night Sky &amp; Weather Atmosphere
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('terrace')}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Close ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Experience the peaceful Diwali night with realistic celestial visuals, including a glowing moon, twinkling stars, and soaring sky lanterns.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => setWeatherMode('starlit')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  weatherMode === 'starlit'
                    ? 'border-amber-400 bg-amber-500/15 text-white'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold text-amber-300">Starlit Moon</span>
                <span className="text-[11px]">Clear starry sky with glowing golden moon &amp; meteors</span>
              </button>

              <button
                onClick={() => setWeatherMode('lanterns')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  weatherMode === 'lanterns'
                    ? 'border-amber-400 bg-amber-500/15 text-white'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold text-amber-300">Sky Lanterns</span>
                <span className="text-[11px]">Dozens of warm floating lanterns ascending</span>
              </button>

              <button
                onClick={() => setWeatherMode('mist')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  weatherMode === 'mist'
                    ? 'border-amber-400 bg-amber-500/15 text-white'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold text-amber-300">Autumn Mist</span>
                <span className="text-[11px]">Gentle evening haze with soft lunar halos</span>
              </button>

              <button
                onClick={() => setWeatherMode('distant_fireworks')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  weatherMode === 'distant_fireworks'
                    ? 'border-amber-400 bg-amber-500/15 text-white'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold text-amber-300">City Skyline Bursts</span>
                <span className="text-[11px]">Gentle distant fireworks over far horizons</span>
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setActiveTab('terrace')}
                className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold rounded-xl transition-colors shadow-md"
              >
                Return to Celebration Arena
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Traditions & Safety Guide Tab */}
      {activeTab === 'guide' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white font-festive">
                Diwali Crackers &amp; Festive Customs
              </h3>
              <button
                onClick={() => setActiveTab('terrace')}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <p>
                In Indian homes, Diwali evening is spent on rooftop terraces with family, lighting clay diyas, making flower rangolis, sharing Kaju Katli and Ladoos, and igniting beloved traditional fireworks with an incense stick (agarbatti).
              </p>
              <div className="space-y-2 pt-2">
                {Object.values(CRACKER_DEFINITIONS).map((c) => (
                  <div key={c.type} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col gap-1">
                    <div className="flex items-center justify-between font-semibold text-amber-300">
                      <span>{c.name} ({c.hindiName}) - {c.subtitle}</span>
                      <span className="text-[10px] text-zinc-400">{c.durationSeconds}s Burn</span>
                    </div>
                    <p className="text-zinc-400 text-[11px]">{c.description}</p>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
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
