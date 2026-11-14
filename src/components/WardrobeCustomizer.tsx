import React, { useMemo, useRef, useState } from 'react';
import {
  CharacterAccessory,
  CharacterActionState,
  CharacterData,
  DressStyle,
  UserProfile
} from '../types';
import { Character } from './Character';
import { AvatarImage } from './AvatarImage';
import {
  ACCESSORY_OPTIONS,
  AVATAR_PRESETS,
  DRESS_STYLE_OPTIONS,
  OUTFIT_COLOR_PRESETS,
  OutfitColorPreset,
  inferGenderFromName
} from '../data/constants';
import {
  Check,
  Link as LinkIcon,
  Palette,
  Shuffle,
  Sparkles,
  Upload,
  User
} from 'lucide-react';

export interface WardrobeFormState {
  displayName: string;
  relation: string;
  gender: 'female' | 'male';
  dressStyle: DressStyle;
  colorPreset: OutfitColorPreset;
  accessory: CharacterAccessory;
  photoURL: string;
}

interface WardrobeCustomizerProps {
  value: WardrobeFormState;
  onChange: (next: WardrobeFormState) => void;
  googlePhotoUrl?: string | null;
  showRelation?: boolean;
  uid?: string;
}

type PreviewPose = 'idle' | 'celebrating' | 'sparkler' | 'sweets';

function resizeImageFileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.onload = (e) => {
      const rawUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const size = 200;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawUrl);
          return;
        }
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(rawUrl);
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  });
}

export const WardrobeCustomizer: React.FC<WardrobeCustomizerProps> = ({
  value,
  onChange,
  googlePhotoUrl,
  showRelation = false,
  uid = 'preview'
}) => {
  const [pose, setPose] = useState<PreviewPose>('idle');
  const [genderManuallySet, setGenderManuallySet] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(
    value.photoURL.startsWith('http') &&
      value.photoURL !== googlePhotoUrl &&
      !AVATAR_PRESETS.some((p) => p.url === value.photoURL)
      ? value.photoURL
      : ''
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateField = (patch: Partial<WardrobeFormState>) => {
    onChange({ ...value, ...patch });
  };

  const applyGenderSwitch = (nextGender: 'female' | 'male', isManual = true) => {
    if (isManual) setGenderManuallySet(true);

    let nextDress = value.dressStyle;
    let nextAccessory = value.accessory;
    let nextPhoto = value.photoURL;

    if (nextGender === 'female') {
      if (nextDress === 'kurta' || nextDress === 'sherwani' || nextDress === 'indo_western') {
        nextDress = 'saree';
      }
      if (nextAccessory === 'pagdi' || nextAccessory === 'shawl') {
        nextAccessory = 'dupatta';
      }
      const presetMatch = AVATAR_PRESETS.find((p) => p.url === nextPhoto);
      if (presetMatch && presetMatch.gender !== 'female') {
        nextPhoto = AVATAR_PRESETS.find((p) => p.id === 'priya')?.url || nextPhoto;
      }
    } else {
      if (
        nextDress === 'saree' ||
        nextDress === 'lehenga' ||
        nextDress === 'anarkali' ||
        nextDress === 'suit'
      ) {
        nextDress = 'kurta';
      }
      if (nextAccessory === 'dupatta' || nextAccessory === 'jhumka' || nextAccessory === 'bindi') {
        nextAccessory = 'none';
      }
      const presetMatch = AVATAR_PRESETS.find((p) => p.url === nextPhoto);
      if (presetMatch && presetMatch.gender !== 'male') {
        nextPhoto = AVATAR_PRESETS.find((p) => p.id === 'aarav')?.url || nextPhoto;
      }
    }

    updateField({
      gender: nextGender,
      dressStyle: nextDress,
      accessory: nextAccessory,
      photoURL: nextPhoto
    });
  };

  const handleNameChange = (name: string) => {
    if (!genderManuallySet) {
      const inferred = inferGenderFromName(name);
      if (inferred && inferred !== value.gender) {
        let nextDress = value.dressStyle;
        if (inferred === 'female' && (nextDress === 'kurta' || nextDress === 'sherwani' || nextDress === 'indo_western')) {
          nextDress = 'saree';
        } else if (inferred === 'male' && (nextDress === 'saree' || nextDress === 'lehenga' || nextDress === 'anarkali' || nextDress === 'suit')) {
          nextDress = 'kurta';
        }
        onChange({
          ...value,
          displayName: name,
          gender: inferred,
          dressStyle: nextDress
        });
        return;
      }
    }
    updateField({ displayName: name });
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uri = await resizeImageFileToDataUri(file);
      updateField({ photoURL: uri });
    } catch {
      // Ignore upload decode issues
    }
  };

  const handleShuffleLook = () => {
    const genderDresses = DRESS_STYLE_OPTIONS.filter((d) => d.recommendedGender === value.gender);
    const dressPool = genderDresses.length > 0 ? genderDresses : DRESS_STYLE_OPTIONS;
    const randomDress = dressPool[Math.floor(Math.random() * dressPool.length)].id;

    const randomColor =
      OUTFIT_COLOR_PRESETS[Math.floor(Math.random() * OUTFIT_COLOR_PRESETS.length)];

    const accessoryPool = ACCESSORY_OPTIONS.filter(
      (a) => a.recommendedGender === 'all' || a.recommendedGender === value.gender
    );
    const randomAccessory =
      accessoryPool[Math.floor(Math.random() * accessoryPool.length)]?.id || 'none';

    updateField({
      dressStyle: randomDress,
      colorPreset: randomColor,
      accessory: randomAccessory
    });
  };

  const sortedDresses = useMemo(
    () =>
      [...DRESS_STYLE_OPTIONS].sort((a, b) => {
        if (a.recommendedGender === value.gender && b.recommendedGender !== value.gender) return -1;
        if (a.recommendedGender !== value.gender && b.recommendedGender === value.gender) return 1;
        return 0;
      }),
    [value.gender]
  );

  const sortedAccessories = useMemo(
    () =>
      [...ACCESSORY_OPTIONS].sort((a, b) => {
        const aScore = a.id === 'none' ? 2 : a.recommendedGender === value.gender ? 1 : a.recommendedGender === 'all' ? 0 : -1;
        const bScore = b.id === 'none' ? 2 : b.recommendedGender === value.gender ? 1 : b.recommendedGender === 'all' ? 0 : -1;
        return bScore - aScore;
      }),
    [value.gender]
  );

  const sortedDps = useMemo(
    () =>
      [...AVATAR_PRESETS].sort((a, b) => {
        if (a.gender === value.gender && b.gender !== value.gender) return -1;
        if (a.gender !== value.gender && b.gender === value.gender) return 1;
        return 0;
      }),
    [value.gender]
  );

  const previewActionState: CharacterActionState =
    pose === 'celebrating' ? 'celebrating' : pose === 'sweets' ? 'sweets' : 'idle';

  const previewCharacter: CharacterData = {
    id: uid,
    uid,
    name: value.displayName.trim() || 'Your Name',
    relation: value.relation || 'Celebrant',
    outfitColor: value.colorPreset.outfitColor,
    accentBg: value.colorPreset.accentBg,
    avatarUrl: value.photoURL,
    xPercent: 50,
    yPercent: 75,
    direction: 'right',
    state: previewActionState,
    holdingSparkler: pose === 'sparkler',
    happiness: 100,
    gender: value.gender,
    dressStyle: value.dressStyle,
    accessory: value.accessory
  };

  const activeDressMeta = DRESS_STYLE_OPTIONS.find((d) => d.id === value.dressStyle);
  const activeAccessoryMeta = ACCESSORY_OPTIONS.find((a) => a.id === value.accessory);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 text-left">
      {/* Left Column: Live Interactive Wardrobe Stage & DP Selector */}
      <div className="md:col-span-5 flex flex-col gap-3">
        <div className="rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.22),_rgba(24,24,27,0.95)_60%,_#09090b_100%)] border border-amber-500/35 p-3.5 flex flex-col items-center relative overflow-hidden">
          {/* Header Row */}
          <div className="w-full flex items-center justify-between gap-2 text-[11px] mb-1">
            <span className="font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Wardrobe</span>
            </span>

            <button
              type="button"
              onClick={handleShuffleLook}
              className="min-h-[34px] px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/35 text-amber-200 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer active:scale-95"
              title="Try a random festive outfit"
            >
              <Shuffle className="w-3 h-3" />
              <span>Shuffle Look</span>
            </button>
          </div>

          {/* Real Fitted Character Preview */}
          <div className="min-h-[196px] sm:min-h-[216px] w-full flex items-end justify-center py-2">
            <Character character={previewCharacter} previewMode />
          </div>

          {/* Active Outfit Summary */}
          <div className="w-full text-center text-[11px] text-zinc-300 border-t border-zinc-800/80 pt-2 mt-1">
            <span className="font-semibold text-amber-200">{activeDressMeta?.label}</span>
            <span className="text-zinc-500"> · </span>
            <span>{value.colorPreset.label}</span>
            {activeAccessoryMeta && activeAccessoryMeta.id !== 'none' && (
              <>
                <span className="text-zinc-500"> · </span>
                <span className="text-amber-300">{activeAccessoryMeta.label}</span>
              </>
            )}
          </div>

          {/* Pose Preview Switcher */}
          <div className="w-full grid grid-cols-4 gap-1 mt-2.5">
            {(
              [
                { id: 'idle', label: 'Stand' },
                { id: 'celebrating', label: 'Dance' },
                { id: 'sparkler', label: 'Sparkler' },
                { id: 'sweets', label: 'Mithai' }
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPose(p.id)}
                className={`min-h-[34px] px-1.5 py-1 rounded-lg text-[10px] font-semibold border transition-colors cursor-pointer ${
                  pose === p.id
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Picture (DP) Controls */}
        <div className="rounded-2xl bg-zinc-900/75 border border-zinc-800 p-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Profile Photo (DP)</span>
            </label>
            <button
              type="button"
              onClick={() => setShowUrlInput((v) => !v)}
              className="min-h-[34px] px-2 text-[11px] text-zinc-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <LinkIcon className="w-3 h-3" />
              <span>{showUrlInput ? 'Hide URL' : 'Paste URL'}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {googlePhotoUrl && (
              <button
                type="button"
                onClick={() => updateField({ photoURL: googlePhotoUrl })}
                className={`flex-1 min-h-[42px] py-1.5 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                  value.photoURL === googlePhotoUrl
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : 'bg-zinc-950 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                }`}
              >
                <span>Google Photo</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadPhoto}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-h-[42px] py-1.5 px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-dashed border-amber-400/60 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Upload Photo</span>
            </button>
          </div>

          {showUrlInput && (
            <input
              type="url"
              value={customUrlInput}
              onChange={(e) => {
                const next = e.target.value;
                setCustomUrlInput(next);
                if (next.trim()) updateField({ photoURL: next.trim() });
              }}
              placeholder="https://... (Paste DP image URL)"
              className="w-full min-h-[42px] px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          )}

          <div className="grid grid-cols-6 gap-1.5 pt-0.5">
            {sortedDps.map((dp) => {
              const isSelected = value.photoURL === dp.url;
              return (
                <button
                  key={dp.id}
                  type="button"
                  onClick={() => updateField({ photoURL: dp.url })}
                  title={dp.label}
                  className={`min-h-[44px] rounded-xl p-1 flex flex-col items-center justify-center border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/25 border-amber-300 ring-2 ring-amber-400/70'
                      : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-zinc-700">
                    <AvatarImage
                      src={dp.url}
                      name={dp.label}
                      characterId={dp.id}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[9px] text-zinc-300 mt-0.5 truncate max-w-full">
                    {dp.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Name, Gender, Traditional Attire, Silk Colors, Accessories */}
      <div className="md:col-span-7 flex flex-col gap-3.5">
        <div className={showRelation ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : ''}>
          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1">
              Display Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={56}
              value={value.displayName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter your name"
              className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-900 border border-amber-500/40 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
            />
          </div>

          {showRelation && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Relation / Tag
              </label>
              <input
                type="text"
                maxLength={56}
                value={value.relation}
                onChange={(e) => updateField({ relation: e.target.value })}
                placeholder="Friend, Sister, Cousin..."
                className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs sm:text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          )}
        </div>

        {/* Gender / Style Preference */}
        <div>
          <label className="block text-xs font-bold text-amber-300 mb-1.5">
            Style Preference
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => applyGenderSwitch('female', true)}
              className={`min-h-[44px] py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                value.gender === 'female'
                  ? 'bg-rose-500/25 border-rose-400 text-rose-200 ring-2 ring-rose-400/50'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span>👩</span>
              <span>Female (महिला)</span>
            </button>
            <button
              type="button"
              onClick={() => applyGenderSwitch('male', true)}
              className={`min-h-[44px] py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                value.gender === 'male'
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 ring-2 ring-amber-400/50'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span>👨</span>
              <span>Male (पुरुष)</span>
            </button>
          </div>
        </div>

        {/* Traditional Indian Outfit Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-amber-300">
              Festive Dress (पोशाक)
            </label>
            <span className="text-[10px] text-zinc-400">
              {DRESS_STYLE_OPTIONS.length} traditional styles
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sortedDresses.map((option) => {
              const isSelected = value.dressStyle === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => updateField({ dressStyle: option.id })}
                  className={`min-h-[58px] p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-center gap-0.5 ${
                    isSelected
                      ? 'bg-amber-500/25 border-amber-300 ring-2 ring-amber-400/70 shadow-md'
                      : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-amber-200' : 'text-white'}`}>
                      {option.label}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-300 stroke-[3] shrink-0" />}
                  </div>
                  <span className="text-[10px] text-amber-300/80 font-medium truncate">
                    {option.hindiLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Silk & Zari Palette */}
        <div>
          <label className="text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            <span>
              Silk Color: <span className="text-white font-semibold">{value.colorPreset.label}</span>
            </span>
          </label>
          <div className="flex items-center flex-wrap gap-2.5">
            {OUTFIT_COLOR_PRESETS.map((preset) => {
              const isSelected = value.colorPreset.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => updateField({ colorPreset: preset })}
                  title={preset.label}
                  aria-label={preset.label}
                  className={`w-10 h-10 rounded-full ${preset.swatchClass} flex items-center justify-center border-2 transition-transform cursor-pointer ${
                    isSelected
                      ? 'border-white scale-110 ring-2 ring-amber-400 shadow-lg'
                      : 'border-zinc-700 hover:scale-105 opacity-85 hover:opacity-100'
                  }`}
                >
                  {isSelected && (
                    <Check
                      className={`w-4 h-4 stroke-[3] ${
                        preset.id === 'ivory_gold' ? 'text-zinc-900' : 'text-white'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Festive Accessories */}
        <div>
          <label className="block text-xs font-bold text-amber-300 mb-1.5">
            Festive Accessories (आभूषण व शृंगार)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {sortedAccessories.map((acc) => {
              const isSelected = value.accessory === acc.id;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => updateField({ accessory: acc.id })}
                  title={acc.description}
                  className={`min-h-[48px] px-2.5 py-1.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-center ${
                    isSelected
                      ? 'bg-amber-500/25 border-amber-300 ring-1 ring-amber-400/70'
                      : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-amber-200' : 'text-zinc-100'}`}>
                      {acc.label}
                    </span>
                    {isSelected && <Check className="w-3 h-3 text-amber-300 shrink-0" />}
                  </div>
                  <span className="text-[9px] text-zinc-400 truncate">{acc.hindiLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export function profileToWardrobeState(
  profile: UserProfile,
  relation = 'Celebrant'
): WardrobeFormState {
  return {
    displayName: profile.displayName || '',
    relation,
    gender: profile.gender || 'female',
    dressStyle: profile.dressStyle || 'saree',
    colorPreset:
      OUTFIT_COLOR_PRESETS.find((c) => c.outfitColor === profile.outfitColor) ||
      OUTFIT_COLOR_PRESETS[0],
    accessory: profile.accessory || 'none',
    photoURL: profile.photoURL
  };
}
