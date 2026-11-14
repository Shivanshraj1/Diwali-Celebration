import React, { useEffect, useState } from 'react';
import { CRACKER_DEFINITIONS } from '../data/constants';
import { CrackerType } from '../types';
import {
  Disc,
  Flame,
  Wand2,
  Rocket,
  Layers,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

interface CrackerSoundboardProps {
  isOpen: boolean;
  onClose: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onTriggerPad: (type: CrackerType, withVisuals: boolean) => void;
}

export const CrackerSoundboard: React.FC<CrackerSoundboardProps> = ({
  isOpen,
  onClose,
  isMuted,
  onToggleMute,
  onTriggerPad
}) => {
  const [syncWithVisuals, setSyncWithVisuals] = useState(true);
  const [activePads, setActivePads] = useState<Record<string, number>>({});

  // Clear expired active glow indicators cleanly
  useEffect(() => {
    if (Object.keys(activePads).length === 0) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setActivePads((prev) => {
        let changed = false;
        const next: Record<string, number> = {};
        Object.entries(prev).forEach(([key, expiresAt]) => {
          if (expiresAt > now) {
            next[key] = expiresAt;
          } else {
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 200);
    return () => clearInterval(timer);
  }, [activePads]);

  if (!isOpen) return null;

  const pads: Array<{
    type: CrackerType;
    shortLabel: string;
    soundLabel: string;
    icon: React.ReactNode;
    accentRing: string;
    padDurationMs: number;
  }> = [
    {
      type: 'phooljhadi',
      shortLabel: 'Phooljhadi',
      soundLabel: 'Crisp Sparkler Hiss',
      icon: <Wand2 className="w-4 h-4 text-sky-400" />,
      accentRing: 'border-sky-400/70 bg-sky-500/20 ring-2 ring-sky-400/40',
      padDurationMs: 2800
    },
    {
      type: 'anar',
      shortLabel: 'Anar',
      soundLabel: 'Ascending Fountain Roar',
      icon: <Flame className="w-4 h-4 text-pink-400" />,
      accentRing: 'border-pink-400/70 bg-pink-500/20 ring-2 ring-pink-400/40',
      padDurationMs: 3200
    },
    {
      type: 'charkhi',
      shortLabel: 'Charkhi',
      soundLabel: 'Spinning Ground Whistle',
      icon: <Disc className="w-4 h-4 text-amber-400" />,
      accentRing: 'border-amber-400/70 bg-amber-500/20 ring-2 ring-amber-400/40',
      padDurationMs: 3000
    },
    {
      type: 'rocket',
      shortLabel: 'Rocket',
      soundLabel: 'Screech & Sky Boom',
      icon: <Rocket className="w-4 h-4 text-rose-400" />,
      accentRing: 'border-rose-400/70 bg-rose-500/20 ring-2 ring-rose-400/40',
      padDurationMs: 2400
    },
    {
      type: 'skyshot',
      shortLabel: 'Skyshots',
      soundLabel: '6 Mortar Sky Bursts',
      icon: <Layers className="w-4 h-4 text-purple-400" />,
      accentRing: 'border-purple-400/70 bg-purple-500/20 ring-2 ring-purple-400/40',
      padDurationMs: 3800
    },
    {
      type: 'sky_letters',
      shortLabel: 'Diwali Blast',
      soundLabel: 'Chime Chord & Finale',
      icon: <Sparkles className="w-4 h-4 text-yellow-300" />,
      accentRing: 'border-yellow-400/70 bg-yellow-500/20 ring-2 ring-yellow-400/40',
      padDurationMs: 3500
    }
  ];

  const handlePadPress = (type: CrackerType, durationMs: number) => {
    if (isMuted) {
      onToggleMute();
    }
    setActivePads((prev) => ({
      ...prev,
      [type]: Date.now() + durationMs
    }));
    onTriggerPad(type, syncWithVisuals);
  };

  return (
    <section
      aria-label="Cracker Soundboard"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      className="w-full max-w-2xl p-3 sm:p-4 rounded-2xl bg-zinc-950/95 border border-amber-500/45 shadow-[0_16px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
            <Volume2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-white font-festive truncate">
              Cracker Soundboard
            </h3>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
              Tap any pad to trigger sound effects {syncWithVisuals ? 'synced with fireworks visuals' : '(audio preview only)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setSyncWithVisuals((v) => !v)}
            aria-pressed={syncWithVisuals}
            className={`min-h-[36px] px-2.5 py-1 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              syncWithVisuals
                ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
            }`}
            title="Toggle triggering courtyard firework visuals with soundboard pads"
          >
            {syncWithVisuals ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{syncWithVisuals ? 'Visuals: ON' : 'Audio Only'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close soundboard"
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mute notice if audio was muted */}
      {isMuted && (
        <div className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-between gap-2 text-[11px] text-rose-200">
          <div className="flex items-center gap-1.5">
            <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>Sound is currently muted — tapping a pad will unmute &amp; play audio.</span>
          </div>
          <button
            type="button"
            onClick={onToggleMute}
            className="px-2 py-0.5 rounded-lg bg-rose-500/25 hover:bg-rose-500/40 text-white font-semibold shrink-0 cursor-pointer"
          >
            Unmute
          </button>
        </div>
      )}

      {/* Soundboard Trigger Pads */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {pads.map((pad) => {
          const def = CRACKER_DEFINITIONS[pad.type];
          const isActive = (activePads[pad.type] || 0) > Date.now();
          return (
            <button
              key={pad.type}
              type="button"
              onClick={() => handlePadPress(pad.type, pad.padDurationMs)}
              className={`min-h-[58px] px-3 py-2 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer active:scale-[0.97] ${
                isActive
                  ? pad.accentRing
                  : 'bg-zinc-900/90 hover:bg-zinc-800/90 border-zinc-800 hover:border-amber-400/50'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                {pad.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-white truncate">{pad.shortLabel}</span>
                  <span className="text-[10px] text-amber-300/80 shrink-0 tabular-nums">
                    {def.durationSeconds}s
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 truncate">{pad.soundLabel}</div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
