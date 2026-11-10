import React, { useState } from 'react';
import { CharacterData } from '../types';
import { Sparkles, Heart, Check, Users, Flame } from 'lucide-react';
import { AvatarImage } from './AvatarImage';
import {
  AARAV_SVG_DATA_URI,
  PRIYA_SVG_DATA_URI,
  KABIR_SVG_DATA_URI,
  ANANYA_SVG_DATA_URI
} from '../assets/demoFaces';
import {
  aaravImg,
  priyaImg,
  kabirImg,
  ananyaImg
} from '../data/constants';

interface InviteWelcomeModalProps {
  invitedBy: string;
  onJoin: (newChar: CharacterData) => void;
  onDismiss: () => void;
}

interface AvatarChoice {
  id: string;
  name: string;
  gender: 'female' | 'male';
  title: string;
  avatarUrl: string;
  outfitColor: string;
  accentBg: string;
}

const AVATAR_CHOICES: AvatarChoice[] = [
  {
    id: 'guest_priya',
    name: 'Priya',
    gender: 'female',
    title: 'Festive Lehenga & Zari Dupatta',
    avatarUrl: priyaImg || PRIYA_SVG_DATA_URI,
    outfitColor: 'from-rose-600 to-red-800',
    accentBg: 'border-rose-400'
  },
  {
    id: 'guest_ananya',
    name: 'Ananya',
    gender: 'female',
    title: 'Emerald Choli & White Gajra',
    avatarUrl: ananyaImg || ANANYA_SVG_DATA_URI,
    outfitColor: 'from-emerald-600 to-teal-800',
    accentBg: 'border-emerald-400'
  },
  {
    id: 'guest_aarav',
    name: 'Aarav',
    gender: 'male',
    title: 'Golden Silk Kurta & Pagdi',
    avatarUrl: aaravImg || AARAV_SVG_DATA_URI,
    outfitColor: 'from-amber-500 to-yellow-600',
    accentBg: 'border-amber-400'
  },
  {
    id: 'guest_kabir',
    name: 'Kabir',
    gender: 'male',
    title: 'Royal Navy Sherwani',
    avatarUrl: kabirImg || KABIR_SVG_DATA_URI,
    outfitColor: 'from-blue-600 to-indigo-900',
    accentBg: 'border-blue-400'
  }
];

export const InviteWelcomeModal: React.FC<InviteWelcomeModalProps> = ({
  invitedBy,
  onJoin,
  onDismiss
}) => {
  const [guestName, setGuestName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarChoice>(AVATAR_CHOICES[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [customRelation, setCustomRelation] = useState(`Friend of ${invitedBy || 'Host'}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = guestName.trim() || selectedAvatar.name;
    const finalAvatar = customAvatarUrl.trim() || selectedAvatar.avatarUrl;

    const newChar: CharacterData = {
      id: `live_guest_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: finalName,
      relation: customRelation,
      outfitColor: selectedAvatar.outfitColor,
      accentBg: selectedAvatar.accentBg,
      avatarUrl: finalAvatar,
      xPercent: Math.floor(25 + Math.random() * 50),
      yPercent: Math.floor(72 + Math.random() * 8),
      direction: Math.random() > 0.5 ? 'right' : 'left',
      state: 'celebrating',
      happiness: 100,
      gender: selectedAvatar.gender,
      speechBubble: {
        text: `Happy Diwali everyone! ${invitedBy ? `Thank you ${invitedBy} for the invite!` : 'So happy to be here!'}`,
        expiresAt: Date.now() + 5000
      }
    };

    onJoin(newChar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border-2 border-amber-500/60 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Luminous Top Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-b from-amber-500/25 via-amber-950/20 to-zinc-950 border-b border-amber-500/30 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mb-2 shadow-lg shadow-amber-500/20">
            <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
          </div>

          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300/90">
            Diwali Celebration Invitation
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white font-festive mt-0.5">
            You're Invited by {invitedBy || 'a Friend'}!
          </h2>
          <p className="text-xs text-zinc-300 mt-1 max-w-md mx-auto leading-relaxed">
            Step onto the terrace, light vibrant fireworks, feed festive sweets, and celebrate the festival of lights together in real time!
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-left">
          {/* Guest Name */}
          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
              <span>Your Name (आपका नाम)</span>
              <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Sneha, Rohan, Pooja, Anshul..."
              className="w-full px-4 py-2.5 bg-zinc-900 border border-amber-500/40 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-medium"
              autoFocus
            />
          </div>

          {/* Relation or Tag */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Your Relation / Note
            </label>
            <input
              type="text"
              value={customRelation}
              onChange={(e) => setCustomRelation(e.target.value)}
              placeholder="e.g. Friend, Cousin, Neighbor..."
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Avatar Choice */}
          <div>
            <label className="block text-xs font-bold text-amber-300 mb-2 flex items-center justify-between">
              <span>Choose Your Festive Avatar &amp; Attire</span>
              <span className="text-[10px] text-zinc-400 font-normal">
                {selectedAvatar.gender === 'female' ? 'Traditional Indian Female Clothes' : 'Traditional Indian Male Kurta'}
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AVATAR_CHOICES.map((choice) => {
                const isSelected = selectedAvatar.id === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(choice);
                      if (!guestName) {
                        setGuestName(choice.name);
                      }
                    }}
                    className={`relative flex flex-col items-center p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/25 border-amber-300 ring-2 ring-amber-400 shadow-md shadow-amber-500/30'
                        : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}

                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-md mb-1.5">
                      <AvatarImage
                        src={choice.avatarUrl}
                        name={choice.name}
                        characterId={choice.id}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <span className="text-xs font-bold text-white leading-tight">
                      {choice.name}
                    </span>
                    <span className="text-[9px] text-zinc-400 line-clamp-1 mt-0.5">
                      {choice.gender === 'female' ? 'Lehenga-Choli' : 'Silk Kurta'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Custom Photo URL */}
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">
              Or paste an Image URL for your custom profile photo (Optional)
            </label>
            <input
              type="url"
              value={customAvatarUrl}
              onChange={(e) => setCustomAvatarUrl(e.target.value)}
              placeholder="https://... (Leave empty to use the selected avatar above)"
              className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onDismiss}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl text-xs font-medium transition-colors"
            >
              Enter as Guest Spectator
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm tracking-wide rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Step into the Celebration!</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
