import React, { useState, useEffect } from 'react';
import { soundEngine, AtmosphereSettings } from '../audio/soundEngine';
import {
  X,
  Wind,
  Building2,
  Music,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders
} from 'lucide-react';

interface AtmosphereControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AtmosphereControlsModal: React.FC<AtmosphereControlsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [settings, setSettings] = useState<AtmosphereSettings>(soundEngine.getAtmosphereSettings());
  const [testedBurst, setTestedBurst] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(soundEngine.getAtmosphereSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleMaster = () => {
    const next = !settings.enabled;
    soundEngine.toggleAtmosphere(next);
    setSettings(soundEngine.getAtmosphereSettings());
  };

  const handleVolumeChange = (vol: number) => {
    soundEngine.updateAtmosphereSettings({ volume: vol });
    setSettings(soundEngine.getAtmosphereSettings());
  };

  const handleToggleLayer = (layer: 'wind' | 'city' | 'music') => {
    const nextVal = !settings[layer];
    soundEngine.updateAtmosphereSettings({ [layer]: nextVal });
    setSettings(soundEngine.getAtmosphereSettings());
  };

  const handleTestDistantFirework = () => {
    soundEngine.playDistantHorizonBurst();
    setTestedBurst(true);
    setTimeout(() => setTestedBurst(false), 1800);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-zinc-950 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        <div className="px-4 sm:px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white font-festive truncate">
                Audio Atmosphere &amp; Ambience
              </h3>
              <p className="text-[11px] text-zinc-400 truncate">
                Evening wind, distant fireworks &amp; sitar notes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close ambience settings"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-900 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {settings.enabled ? (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-zinc-500" />
                )}
                <span className="text-xs font-semibold text-white">Background Ambience</span>
              </div>

              <button
                type="button"
                onClick={handleToggleMaster}
                className={`min-h-[38px] px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  settings.enabled
                    ? 'bg-amber-500/25 text-amber-300 border-amber-400/50'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                {settings.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Ambience Volume</span>
                <span className="font-mono text-amber-300">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-zinc-800 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Ambient Audio Layers
            </span>

            {[
              {
                key: 'wind' as const,
                title: 'Soft Evening Wind',
                desc: 'Gentle breeze across lanterns & open skies',
                icon: <Wind className="w-4 h-4 text-sky-400" />,
                active: settings.wind
              },
              {
                key: 'city' as const,
                title: 'Distant City & Fireworks',
                desc: 'Faint horizon bursts and evening hum',
                icon: <Building2 className="w-4 h-4 text-amber-400" />,
                active: settings.city
              },
              {
                key: 'music' as const,
                title: 'Festive Sitar & Tanpura',
                desc: 'Soft classical tanpura & sitar melody',
                icon: <Music className="w-4 h-4 text-rose-400" />,
                active: settings.music
              }
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 truncate">{item.title}</div>
                    <div className="text-[10px] text-zinc-400 truncate">{item.desc}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleLayer(item.key)}
                  aria-pressed={item.active}
                  className={`min-w-[48px] min-h-[28px] rounded-full transition-colors relative shrink-0 cursor-pointer ${
                    item.active ? 'bg-amber-400' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-black absolute top-1 transition-transform ${
                      item.active ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleTestDistantFirework}
              className="min-h-[42px] px-3 py-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{testedBurst ? 'Boom heard! ✨' : 'Preview Distant Boom'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-colors shadow-md cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
