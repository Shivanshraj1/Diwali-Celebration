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
  Sliders,
  Check
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-festive">
                Audio Atmosphere &amp; Ambience
              </h3>
              <p className="text-[11px] text-zinc-400">
                Immersive night wind, distant city, and faint festive music
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Master Ambience Toggle & Volume */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.enabled ? (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-zinc-500" />
                )}
                <span className="text-xs font-semibold text-white">
                  Background Ambience
                </span>
              </div>

              <button
                onClick={handleToggleMaster}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  settings.enabled
                    ? 'bg-amber-500/25 text-amber-300 border-amber-400/50 shadow-sm'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                {settings.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Volume Slider */}
            <div className="space-y-1">
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
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>
          </div>

          {/* Individual Layers */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Ambient Audio Layers
            </span>

            {/* Layer 1: Soft Night Wind */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                  <Wind className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-200">
                    Soft Evening Wind
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Gentle breeze murmuring across lanterns &amp; open skies
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleToggleLayer('wind')}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  settings.wind ? 'bg-amber-400' : 'bg-zinc-800'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full bg-black absolute top-0.5 transition-transform ${
                    settings.wind ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Layer 2: Distant City & Far Horizon Fireworks */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-200">
                    Distant City &amp; Far Fireworks
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Muted urban hum and faint horizon fireworks thuds
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleToggleLayer('city')}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  settings.city ? 'bg-amber-400' : 'bg-zinc-800'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full bg-black absolute top-0.5 transition-transform ${
                    settings.city ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Layer 3: Faint Festive Music */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                  <Music className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-200">
                    Faint Festive Music
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Indian tanpura drone &amp; subtle drifting sitar notes
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleToggleLayer('music')}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  settings.music ? 'bg-amber-400' : 'bg-zinc-800'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full bg-black absolute top-0.5 transition-transform ${
                    settings.music ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Test Distant Firework Button */}
          <div className="pt-1 flex items-center justify-between">
            <button
              onClick={handleTestDistantFirework}
              className="px-3 py-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{testedBurst ? 'Boom heard in distance! ✨' : 'Preview Distant Firework Boom'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-colors shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
