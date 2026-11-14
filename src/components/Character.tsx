import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CharacterData, DressStyle, SweetType } from '../types';
import { Heart, Sparkles } from 'lucide-react';
import { AvatarImage } from './AvatarImage';

interface CharacterProps {
  character: CharacterData;
  onDropCracker?: (characterId: string, crackerType: string) => void;
  onDropSweet?: (characterId: string, sweetType: SweetType) => void;
  onClick?: (characterId: string) => void;
  previewMode?: boolean;
}

export const resolveCharacterDress = (
  character: Pick<CharacterData, 'id' | 'gender' | 'dressStyle'>
): DressStyle => {
  if (character.dressStyle) return character.dressStyle;
  const isFemale = character.gender === 'female' || character.id === 'priya' || character.id === 'ananya';
  return isFemale ? 'saree' : 'kurta';
};

export const Character: React.FC<CharacterProps> = React.memo(({
  character,
  onDropCracker,
  onDropSweet,
  onClick,
  previewMode = false
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    if (previewMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    if (previewMode) return;
    e.preventDefault();
    const crackerType = e.dataTransfer.getData('application/cracker');
    const sweetType = e.dataTransfer.getData('application/sweet') as SweetType;

    if (crackerType && onDropCracker) {
      onDropCracker(character.id, crackerType);
    } else if (sweetType && onDropSweet) {
      onDropSweet(character.id, sweetType);
    }
  };

  const isWalking = character.state === 'walking';
  const isIgniting = character.state === 'igniting';
  const isRunningBack = character.state === 'running_back';
  const isCoveringEars = character.state === 'covering_ears';
  const isCelebrating = character.state === 'celebrating';
  const isEatingSweet = character.state === 'sweets';

  const dressStyle = resolveCharacterDress(character);
  const accessory = character.accessory || 'none';

  const leftArmAnimate = isCoveringEars
    ? { rotate: [-140, -145, -140], y: -14, x: 7 }
    : isEatingSweet
    ? { rotate: [-45, -50, -45], y: -9, x: 4 }
    : isCelebrating
    ? { rotate: [-40, -52, -40], y: -9 }
    : isIgniting
    ? { rotate: [15, 25, 15], y: 12 }
    : { rotate: [0, 5, 0] };

  const rightArmAnimate = isCoveringEars
    ? { rotate: [140, 145, 140], y: -14, x: -7 }
    : isEatingSweet
    ? { rotate: [45, 50, 45], y: -9, x: -4 }
    : isCelebrating
    ? { rotate: [40, 55, 40], y: -9 }
    : isIgniting
    ? { rotate: [-20, -55, -20], y: 14 }
    : { rotate: [0, -5, 0] };

  const renderHandsAndProps = (showBangles: boolean) => (
    <>
      <motion.div
        animate={leftArmAnimate}
        className="absolute -left-1.5 sm:-left-2 top-1.5 sm:top-2 w-2.5 sm:w-3.5 h-9 sm:h-12 rounded-full bg-gradient-to-b from-amber-600 to-amber-700 origin-top shadow-sm flex flex-col justify-end items-center pb-1"
      >
        {showBangles && (
          <>
            <div className="w-2.5 sm:w-3.5 h-1 bg-amber-300 rounded-sm shadow-[0_0_4px_#FDE047]" />
            <div className="w-2 sm:w-3 h-0.5 bg-rose-500 rounded-sm" />
          </>
        )}
      </motion.div>

      <motion.div
        animate={rightArmAnimate}
        className="absolute -right-1.5 sm:-right-2 top-1.5 sm:top-2 w-2.5 sm:w-3.5 h-9 sm:h-12 rounded-full bg-gradient-to-b from-amber-600 to-amber-700 origin-top shadow-sm flex flex-col justify-end items-center pb-1"
      >
        {showBangles && (
          <>
            <div className="w-2.5 sm:w-3.5 h-1 bg-amber-300 rounded-sm shadow-[0_0_4px_#FDE047]" />
            <div className="w-2 sm:w-3 h-0.5 bg-rose-500 rounded-sm" />
          </>
        )}

        {!isCoveringEars && !isEatingSweet && !character.holdingSparkler && (
          <div className="absolute -bottom-4 sm:-bottom-5 -right-2.5 sm:-right-3 w-1 h-10 sm:h-14 bg-amber-900/90 rotate-45 origin-bottom flex flex-col justify-start items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#EF4444] animate-ping" />
            <div className="w-1 h-2.5 bg-zinc-300/40 rounded-full blur-[1px] -mt-1" />
          </div>
        )}

        {character.holdingSparkler && (
          <div className="absolute -bottom-3 -right-2.5 w-1.5 h-12 sm:h-16 bg-zinc-300 rotate-45 origin-bottom">
            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-yellow-200 shadow-[0_0_16px_#FDE047] animate-ping" />
          </div>
        )}
      </motion.div>
    </>
  );

  // Chest/neckwear overlays (Mala necklace, Dupatta drape, Embroidered Shawl) rendered naturally on top of torso
  const renderTorsoAccessories = () => (
    <>
      {accessory === 'mala' && (
        <div className="pointer-events-none absolute top-0.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
          <div className="w-7 sm:w-9 h-3.5 sm:h-4 rounded-b-full border-b-[3px] border-x-2 border-amber-100/95 shadow-[0_2px_6px_rgba(253,224,71,0.5)] flex items-end justify-center">
            <div className="w-2 h-2 rounded-full bg-rose-500 border border-amber-300 -mb-1" />
          </div>
        </div>
      )}

      {accessory === 'dupatta' && (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
          <div className="absolute -left-2 top-0 w-16 sm:w-20 h-3.5 sm:h-4 bg-gradient-to-r from-amber-300/75 via-rose-400/65 to-amber-200/50 rotate-[32deg] origin-left border-y border-amber-200/80 shadow-md rounded-full" />
          <div className="absolute -right-2 top-3 w-2 sm:w-2.5 h-16 sm:h-20 bg-gradient-to-b from-rose-400/70 via-amber-300/70 to-amber-500/80 border-x border-amber-200/60 rounded-b-md" />
        </div>
      )}

      {accessory === 'shawl' && (
        <div className="pointer-events-none absolute -top-0.5 inset-x-0 z-20 flex justify-between px-0.5">
          <div className="w-2.5 sm:w-3 h-14 sm:h-18 bg-gradient-to-b from-red-800 via-amber-700 to-amber-500 border-x border-amber-300/80 rounded-b-md shadow-md" />
          <div className="w-2.5 sm:w-3 h-14 sm:h-18 bg-gradient-to-b from-red-800 via-amber-700 to-amber-500 border-x border-amber-300/80 rounded-b-md shadow-md" />
        </div>
      )}
    </>
  );

  const renderDressBody = () => {
    switch (dressStyle) {
      case 'saree':
        return (
          <div className="relative -mt-2 z-0 flex flex-col items-center">
            <div
              className={`w-10 h-11 sm:w-13 sm:h-14 md:w-15 md:h-16 rounded-t-xl bg-gradient-to-b ${character.outfitColor} shadow-md border-t-2 border-amber-300 relative flex justify-center overflow-visible`}
            >
              <div className="absolute top-1.5 w-5 sm:w-7 h-2 rounded-b-full border-b-2 border-amber-300/90 bg-amber-950/25" />
              <div className="absolute -left-2 -top-1 w-14 sm:w-16 h-5 bg-gradient-to-r from-amber-300/80 via-yellow-200/70 to-transparent rotate-[28deg] origin-left border-b-2 border-amber-400 shadow-sm" />
              {renderTorsoAccessories()}
              {renderHandsAndProps(true)}
            </div>
            <div className="w-10 sm:w-13 md:w-15 h-1 sm:h-1.5 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 shadow-sm z-10 -mt-0.5" />
            <div className={`w-11 h-12 sm:w-14 sm:h-16 md:w-16 md:h-20 bg-gradient-to-b ${character.outfitColor} rounded-b-xl shadow-lg relative overflow-hidden flex justify-center`}>
              <div className="w-4 sm:w-5 h-full bg-black/15 flex justify-around px-0.5">
                <div className="w-0.5 h-full bg-amber-300/50" />
                <div className="w-0.5 h-full bg-black/25" />
                <div className="w-0.5 h-full bg-amber-300/50" />
              </div>
              <div className="absolute bottom-0 inset-x-0 h-2 bg-gradient-to-r from-amber-500 via-yellow-200 to-amber-500 border-t border-amber-200" />
            </div>
            <div className="flex gap-2 -mt-0.5">
              <div className="w-3 h-1.5 sm:w-3.5 sm:h-2 bg-amber-500 rounded-b-full border-t border-amber-300 shadow-sm" />
              <div className="w-3 h-1.5 sm:w-3.5 sm:h-2 bg-amber-500 rounded-b-full border-t border-amber-300 shadow-sm" />
            </div>
          </div>
        );

      case 'lehenga':
        return (
          <div className="relative -mt-2 z-0 flex flex-col items-center">
            <div
              className={`w-10 h-11 sm:w-13 sm:h-14 md:w-15 md:h-17 rounded-t-xl bg-gradient-to-b ${character.outfitColor} shadow-md border-t-2 border-amber-300 relative flex justify-center overflow-visible`}
            >
              <div className="absolute top-1.5 w-5 sm:w-7 h-2 rounded-b-full border-b-2 border-amber-300/90 bg-amber-950/20" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-300/35 to-amber-200/50 -rotate-12 translate-x-1 overflow-hidden rounded-t-xl" />
              {renderTorsoAccessories()}
              {renderHandsAndProps(true)}
            </div>
            <div className="w-11 sm:w-14 md:w-16 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 shadow-sm z-10 -mt-0.5 relative flex justify-end pr-1">
              <div className="w-1 h-3 sm:h-4 bg-amber-300 rounded-full shadow-[0_0_4px_#FDE047]" />
            </div>
            <div className={`w-13 h-12 sm:w-16 sm:h-15 md:w-20 md:h-18 bg-gradient-to-b ${character.outfitColor} rounded-b-2xl shadow-lg border-b-4 border-amber-300 relative overflow-hidden flex justify-around`}>
              <div className="w-0.5 h-full bg-black/20" />
              <div className="w-0.5 h-full bg-amber-300/30" />
              <div className="w-0.5 h-full bg-black/20" />
              <div className="w-0.5 h-full bg-amber-300/30" />
              <div className="w-0.5 h-full bg-black/20" />
              <div className="absolute bottom-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 opacity-90 shadow-inner" />
            </div>
            <div className="flex gap-2 -mt-0.5">
              <div className="w-3 h-1.5 sm:w-3.5 sm:h-2 bg-amber-500 rounded-b-full border-t border-amber-300 shadow-sm" />
              <div className="w-3 h-1.5 sm:w-3.5 sm:h-2 bg-amber-500 rounded-b-full border-t border-amber-300 shadow-sm" />
            </div>
          </div>
        );

      case 'anarkali':
        return (
          <div className="relative -mt-2 z-0 flex flex-col items-center">
            {/* Fitted Embroidered Choli Bodice */}
            <div
              className={`w-10 h-10 sm:w-13 sm:h-12 md:w-14 md:h-14 rounded-t-xl bg-gradient-to-b ${character.outfitColor} shadow-md border-t-2 border-amber-300 relative flex justify-center overflow-visible`}
            >
              <div className="w-4 sm:w-5 h-4 sm:h-6 rounded-b-full border-x border-b border-amber-300/90 bg-amber-300/20 mt-0.5" />
              {renderTorsoAccessories()}
              {renderHandsAndProps(true)}
            </div>
            {/* Zari Empire Waistline */}
            <div className="w-10 sm:w-13 md:w-14 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 shadow-sm z-10 -mt-0.5" />
            {/* Flowing Umberella-Cut Pleated Flare Gown */}
            <div
              className={`w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-21 bg-gradient-to-b ${character.outfitColor} rounded-t-sm rounded-b-[22px] shadow-xl border-b-4 border-amber-300 relative overflow-hidden flex justify-around`}
              style={{ clipPath: 'polygon(14% 0%, 86% 0%, 100% 100%, 0% 100%)' }}
            >
              <div className="w-0.5 h-full bg-amber-200/35 rotate-[4deg]" />
              <div className="w-0.5 h-full bg-black/20" />
              <div className="w-0.5 h-full bg-amber-200/45" />
              <div className="w-0.5 h-full bg-black/20" />
              <div className="w-0.5 h-full bg-amber-200/35 -rotate-[4deg]" />
              <div className="absolute bottom-0 inset-x-0 h-2.5 bg-gradient-to-r from-amber-500 via-yellow-200 to-amber-500 border-t border-amber-200" />
            </div>
            <div className="flex gap-2 -mt-0.5">
              <div className="w-3 h-1.5 sm:w-3.5 sm:h-2 bg-amber-500 rounded-b-full border-t border-amber-300 shadow-sm" />
              <div className="w-3 h-1.5 sm:w-3.5 sm:h-2 bg-amber-500 rounded-b-full border-t border-amber-300 shadow-sm" />
            </div>
          </div>
        );

      case 'suit':
        return (
          <div className="relative -mt-2 z-0 flex flex-col items-center">
            <div
              className={`w-10 h-12 sm:w-13 sm:h-15 md:w-15 md:h-17 rounded-t-xl bg-gradient-to-b ${character.outfitColor} shadow-md border-t-2 border-amber-300 relative flex justify-center overflow-visible`}
            >
              <div className="w-4 sm:w-5 h-5 sm:h-7 rounded-b-lg border-x border-b border-amber-300/80 bg-amber-400/20 mt-0.5 flex flex-col items-center justify-around py-1">
                <div className="w-1 h-1 rounded-full bg-amber-200" />
                <div className="w-1 h-1 rounded-full bg-amber-200" />
              </div>
              <div className="absolute left-0 top-0 bottom-0 w-1.5 sm:w-2 bg-gradient-to-b from-amber-300/80 to-amber-200/30 border-r border-amber-200/50 rounded-tl-xl" />
              <div className="absolute right-0 top-0 bottom-0 w-1.5 sm:w-2 bg-gradient-to-b from-amber-300/80 to-amber-200/30 border-l border-amber-200/50 rounded-tr-xl" />
              {renderTorsoAccessories()}
              {renderHandsAndProps(true)}
            </div>
            <div className={`w-12 h-8 sm:w-15 sm:h-10 md:w-17 md:h-11 bg-gradient-to-b ${character.outfitColor} rounded-b-lg shadow-md border-b-2 border-amber-300 relative flex justify-center`}>
              <div className="w-0.5 h-full bg-amber-300/30" />
              <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 opacity-90" />
            </div>
            <div className="flex gap-1 -mt-0.5">
              <div className="w-3 sm:w-4 h-5 sm:h-7 bg-gradient-to-b from-amber-100 to-amber-200 rounded-b-md border-x border-amber-400/40" />
              <div className="w-3 sm:w-4 h-5 sm:h-7 bg-gradient-to-b from-amber-100 to-amber-200 rounded-b-md border-x border-amber-400/40" />
            </div>
            <div className="flex gap-2 -mt-0.5">
              <div className="w-3 h-1.5 sm:w-3.5 sm:h-2 bg-amber-600 rounded-b-full border-t border-amber-300 shadow-sm" />
              <div className="w-3 h-1.5 sm:w-3.5 sm:h-2 bg-amber-600 rounded-b-full border-t border-amber-300 shadow-sm" />
            </div>
          </div>
        );

      case 'sherwani':
        return (
          <div className="relative -mt-2 z-0 flex flex-col items-center">
            <div
              className={`w-11 h-16 sm:w-14 sm:h-20 md:w-16 md:h-24 rounded-t-xl rounded-b-lg bg-gradient-to-b ${character.outfitColor} shadow-lg border-t-2 border-amber-300 relative flex justify-center overflow-visible`}
            >
              <div className="absolute top-0 w-6 sm:w-7 h-2 bg-amber-400/90 rounded-b-md border-b border-yellow-200" />
              <div className="w-1 h-full bg-amber-300/70 flex flex-col items-center justify-center gap-2 pt-3">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-200" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-200" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-200" />
              </div>
              <div className="absolute left-1 top-0 bottom-0 w-2 bg-gradient-to-b from-amber-300 via-yellow-200/80 to-amber-500/50 opacity-85 rounded-tl-xl" />
              {renderTorsoAccessories()}
              {renderHandsAndProps(false)}
            </div>
            <div className="w-9 h-8 sm:w-11 sm:h-10 md:w-13 md:h-12 bg-gradient-to-b from-amber-100 to-amber-200 rounded-b-md shadow-md border-t border-amber-400/40 relative">
              <div className="w-0.5 h-full mx-auto bg-amber-400/50" />
            </div>
            <div className="flex gap-2 -mt-1">
              <div className="w-3.5 sm:w-4 h-2 sm:h-2.5 bg-amber-700 rounded-b-full border-t border-amber-400" />
              <div className="w-3.5 sm:w-4 h-2 sm:h-2.5 bg-amber-700 rounded-b-full border-t border-amber-400" />
            </div>
          </div>
        );

      case 'indo_western':
        return (
          <div className="relative -mt-2 z-0 flex flex-col items-center">
            {/* Tailored Bandhgala / Asymmetrical Jacket Cut */}
            <div
              className={`w-11 h-14 sm:w-14 sm:h-18 md:w-16 md:h-21 rounded-t-xl rounded-b-md bg-gradient-to-b ${character.outfitColor} shadow-lg border-t-2 border-amber-300 relative flex justify-center overflow-visible`}
            >
              {/* Mandarin Collar */}
              <div className="absolute top-0 w-6 sm:w-7 h-2 bg-zinc-900/70 border-b border-amber-300 rounded-b-sm" />
              {/* Diagonal Overlap Lapel + Golden Buttons */}
              <div className="absolute top-1.5 right-2.5 sm:right-3 w-0.5 h-11 sm:h-14 bg-amber-300/85 rotate-[8deg] flex flex-col justify-around py-1.5 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-200 shadow-sm" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-200 shadow-sm" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-200 shadow-sm" />
              </div>
              {/* Silk Pocket Square & Brooch */}
              <div className="absolute top-3.5 left-1.5 sm:left-2 w-2.5 sm:w-3 h-2 bg-amber-200 rotate-[-8deg] border-b border-amber-400 rounded-t-sm shadow-sm" />
              {/* Asymmetric Drape Hem */}
              <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400/90 via-yellow-200/70 to-transparent" />
              {renderTorsoAccessories()}
              {renderHandsAndProps(false)}
            </div>
            {/* Slim Structured Trousers */}
            <div className="flex gap-1 -mt-0.5">
              <div className="w-4 sm:w-5 h-9 sm:h-11 md:h-13 bg-gradient-to-b from-zinc-900 to-zinc-800 rounded-b-md border-x border-amber-400/30" />
              <div className="w-4 sm:w-5 h-9 sm:h-11 md:h-13 bg-gradient-to-b from-zinc-900 to-zinc-800 rounded-b-md border-x border-amber-400/30" />
            </div>
            <div className="flex gap-2 -mt-1">
              <div className="w-3.5 sm:w-4 h-2 sm:h-2.5 bg-zinc-950 rounded-b-full border-t border-amber-400" />
              <div className="w-3.5 sm:w-4 h-2 sm:h-2.5 bg-zinc-950 rounded-b-full border-t border-amber-400" />
            </div>
          </div>
        );

      case 'kurta':
      default:
        return (
          <div className="relative -mt-2 z-0 flex flex-col items-center">
            <div
              className={`w-11 h-12 sm:w-14 sm:h-16 md:w-16 md:h-20 rounded-t-xl bg-gradient-to-b ${character.outfitColor} shadow-md border-t border-amber-300/40 relative flex justify-center overflow-visible`}
            >
              <div className="w-1.5 h-full bg-amber-300/60 shadow-[0_0_4px_rgba(253,224,71,0.5)]" />
              <div className="absolute top-2 w-6 sm:w-8 h-2.5 rounded-full border-t border-amber-300/80" />
              {renderTorsoAccessories()}
              {renderHandsAndProps(false)}
            </div>
            <div className="w-9 h-10 sm:w-12 sm:h-14 md:w-14 md:h-16 bg-gradient-to-b from-amber-100 to-amber-200 rounded-b-md shadow-md border-t border-amber-400/40 relative">
              <div className="w-0.5 h-full mx-auto bg-amber-400/50" />
            </div>
            <div className="flex gap-2 -mt-1">
              <div className="w-3.5 sm:w-4 h-2 sm:h-2.5 bg-amber-700 rounded-b-full border-t border-amber-400" />
              <div className="w-3.5 sm:w-4 h-2 sm:h-2.5 bg-amber-700 rounded-b-full border-t border-amber-400" />
            </div>
          </div>
        );
    }
  };

  const characterBodyStack = (
    <>
      {/* Headwear / Face Portrait & Accessories */}
      <div className="relative">
        {/* Royal Pagdi (Turban with Jeweled Kalgi) */}
        {accessory === 'pagdi' && (
          <div className="pointer-events-none absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
            <div className="relative w-14 sm:w-18 md:w-22 h-6 sm:h-7 rounded-t-full rounded-b-lg bg-gradient-to-r from-rose-700 via-amber-500 to-rose-700 border-2 border-amber-300 shadow-lg overflow-hidden">
              <div className="absolute inset-x-0 top-1.5 h-1 bg-amber-200/75 rotate-[-8deg]" />
              <div className="absolute inset-x-0 bottom-1 h-1 bg-amber-300/80 rotate-[6deg]" />
            </div>
            {/* Kalgi Feather */}
            <div className="absolute -top-3 right-2 sm:right-3 w-2.5 h-5 rounded-full bg-gradient-to-t from-amber-400 via-emerald-400 to-white rotate-[18deg] border border-amber-200 shadow-[0_0_8px_#34D399]" />
          </div>
        )}

        <div
          className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 ${character.accentBg} shadow-xl shadow-black/90 relative z-10 transition-transform group-hover:scale-105`}
        >
          <AvatarImage
            src={character.avatarUrl}
            name={character.name}
            characterId={character.id}
            className="w-full h-full object-cover"
          />

          {/* Stylish Festive Aviators */}
          {accessory === 'glasses' && (
            <div className="pointer-events-none absolute top-[32%] left-1/2 -translate-x-1/2 w-[78%] flex items-center justify-between gap-0.5 z-20">
              <div className="flex-1 h-3 sm:h-4 rounded-b-lg rounded-t-sm bg-zinc-950/85 border border-amber-300 shadow-inner" />
              <div className="w-1.5 h-0.5 bg-amber-300 shrink-0" />
              <div className="flex-1 h-3 sm:h-4 rounded-b-lg rounded-t-sm bg-zinc-950/85 border border-amber-300 shadow-inner" />
            </div>
          )}
        </div>

        {/* Jhumka Chandbali Earrings */}
        {accessory === 'jhumka' && (
          <>
            <div className="pointer-events-none absolute top-[55%] -left-1.5 sm:-left-2 z-20 flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-amber-300 border border-amber-600 shadow" />
              <div className="w-2.5 h-2 rounded-b-full bg-gradient-to-b from-amber-300 to-amber-500 -mt-0.5 shadow-[0_0_6px_#FDE047]" />
            </div>
            <div className="pointer-events-none absolute top-[55%] -right-1.5 sm:-right-2 z-20 flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-amber-300 border border-amber-600 shadow" />
              <div className="w-2.5 h-2 rounded-b-full bg-gradient-to-b from-amber-300 to-amber-500 -mt-0.5 shadow-[0_0_6px_#FDE047]" />
            </div>
          </>
        )}

        {/* Tilak or Maang-Tikka & Bindi */}
        {accessory === 'bindi' ? (
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
            <div className="w-0.5 h-2 sm:h-2.5 bg-amber-300" />
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-300 border border-rose-600 shadow-[0_0_8px_#F59E0B]" />
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 shadow-[0_0_4px_#F43F5E]" />
          </div>
        ) : (
          <div className="absolute top-0.5 sm:top-1 left-1/2 -translate-x-1/2 w-1 sm:w-1.5 h-2 sm:h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B] z-20" />
        )}
      </div>

      {/* Traditional Festive Dress */}
      {renderDressBody()}

      {/* Clean Name & Status Label (no backdrop-blur over live canvas) */}
      <div className="mt-1.5 px-2 sm:px-2.5 py-0.5 bg-zinc-950/95 border border-amber-500/40 rounded-lg text-[10px] sm:text-[11px] font-medium text-amber-200 shadow-md flex items-center gap-1 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
        <span className="font-semibold text-white max-w-[85px] sm:max-w-[120px] truncate">
          {character.isCurrentUser ? `${character.name} (You)` : character.name}
        </span>
      </div>
    </>
  );

  const innerCharacterRig = (
    <>
      {/* Ground Shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 sm:w-28 h-5 bg-black/55 rounded-full pointer-events-none" />
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-2.5 bg-amber-500/20 rounded-full pointer-events-none" />

      {/* Main Character Body & Portrait (pure CSS idle float, Motion only for active choreography) */}
      {character.state === 'idle' ? (
        <div className="relative flex flex-col items-center animate-char-idle">
          {characterBodyStack}
        </div>
      ) : (
        <motion.div
          animate={
            isIgniting
              ? { y: [0, 20, 20], scale: [1, 0.92, 0.92] }
              : isRunningBack
              ? { x: character.direction === 'right' ? [-20, 0] : [20, 0], y: [0, -8, 0], rotate: character.direction === 'right' ? -10 : 10 }
              : isCoveringEars
              ? { y: [0, 4, 0], scale: [1, 0.98, 1] }
              : isCelebrating
              ? { y: [0, -16, 0], scale: [1, 1.05, 1] }
              : isWalking
              ? { y: [0, -6, 0], rotate: [-3, 3, -3] }
              : { y: 0 }
          }
          transition={{
            duration: isRunningBack ? 0.35 : isWalking ? 0.45 : isCelebrating ? 0.55 : 0.3,
            repeat: isIgniting || isCoveringEars ? 0 : Infinity,
            ease: 'easeInOut'
          }}
          className="relative flex flex-col items-center will-change-transform"
        >
          {characterBodyStack}
        </motion.div>
      )}
    </>
  );

  if (previewMode) {
    return (
      <div className="relative inline-flex flex-col items-center justify-end pt-6 pb-2 px-4 select-none">
        {innerCharacterRig}
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(character.id);
      }}
      className="absolute cursor-pointer select-none group touch-manipulation min-w-[44px] min-h-[44px]"
      style={{
        left: `${character.xPercent}%`,
        top: `${character.yPercent}%`,
        transform: 'translate(-50%, -90%)',
        zIndex: Math.floor(character.yPercent * 10)
      }}
    >
      {/* Speech Bubble (no backdrop-blur over active canvas) */}
      <AnimatePresence>
        {character.speechBubble && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.85 }}
            className={`absolute -top-16 sm:-top-20 left-1/2 -translate-x-1/2 z-40 max-w-[200px] sm:max-w-[260px] truncate px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl shadow-2xl pointer-events-none flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold ${
              isRunningBack || isCoveringEars
                ? 'bg-rose-950/95 border border-rose-500/80 text-rose-200 shadow-rose-500/25'
                : 'bg-zinc-950/95 border border-amber-500/70 text-amber-200 shadow-amber-500/15'
            }`}
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{character.speechBubble.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sweets Cheer Hearts */}
      <AnimatePresence>
        {isEatingSweet && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -32 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 text-rose-400 pointer-events-none whitespace-nowrap"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span className="text-[11px] text-amber-300 font-festive font-bold">धन्यवाद!</span>
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {innerCharacterRig}
    </div>
  );
});
