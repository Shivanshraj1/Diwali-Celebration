import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Sparkles, Flame } from 'lucide-react';
import {
  WardrobeCustomizer,
  WardrobeFormState,
  profileToWardrobeState
} from './WardrobeCustomizer';

interface InviteWelcomeModalProps {
  invitedBy: string;
  roomTitle?: string;
  initialProfile: UserProfile;
  googlePhotoUrl?: string | null;
  onJoin: (customizedProfile: UserProfile, relation: string) => void;
  onDismiss: () => void;
}

export const InviteWelcomeModal: React.FC<InviteWelcomeModalProps> = ({
  invitedBy,
  roomTitle,
  initialProfile,
  googlePhotoUrl,
  onJoin,
  onDismiss
}) => {
  const [wardrobe, setWardrobe] = useState<WardrobeFormState>(() =>
    profileToWardrobeState(initialProfile, `Friend of ${invitedBy || 'Host'}`)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = wardrobe.displayName.trim() || initialProfile.displayName || 'Friend';

    const updated: UserProfile = {
      uid: initialProfile.uid,
      displayName: finalName,
      photoURL: wardrobe.photoURL,
      gender: wardrobe.gender,
      dressStyle: wardrobe.dressStyle,
      outfitColor: wardrobe.colorPreset.outfitColor,
      accentBg: wardrobe.colorPreset.accentBg,
      accessory: wardrobe.accessory
    };

    onJoin(updated, wardrobe.relation.trim() || `Friend of ${invitedBy || 'Host'}`);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-zinc-950/92 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl bg-zinc-950 border-2 border-amber-500/60 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.3)] overflow-hidden flex flex-col max-h-[94dvh]">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-amber-500/20 via-amber-900/25 to-rose-900/20 border-b border-amber-500/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
            </div>
            <div className="min-w-0 text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300/90 block truncate">
                {roomTitle || 'Diwali Celebration Invitation'}
              </span>
              <h2 className="text-base sm:text-xl font-black text-white font-festive truncate">
                Join {invitedBy || 'Host'} Live ✨
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="min-h-[42px] px-3 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 rounded-xl text-xs font-medium shrink-0 transition-colors cursor-pointer"
          >
            Join Quickly
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-3.5 sm:p-6 overflow-y-auto flex-1">
            <WardrobeCustomizer
              value={wardrobe}
              onChange={setWardrobe}
              googlePhotoUrl={googlePhotoUrl}
              showRelation
              uid={initialProfile.uid}
            />
          </div>

          {/* Sticky Bottom CTA */}
          <div className="px-4 py-3 sm:px-6 sm:py-4 bg-zinc-950/95 border-t border-zinc-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onDismiss}
              className="min-h-[44px] px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              Join With Default Look
            </button>

            <button
              type="submit"
              className="min-h-[48px] flex-1 sm:flex-none sm:min-w-[240px] py-2.5 px-5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm tracking-wide rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Enter Celebration Room</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
