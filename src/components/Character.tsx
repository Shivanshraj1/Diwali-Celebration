import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CharacterData, SweetType } from '../types';
import { Heart, Sparkles } from 'lucide-react';
import { AvatarImage } from './AvatarImage';

interface CharacterProps {
  character: CharacterData;
  onDropCracker: (characterId: string, crackerType: string) => void;
  onDropSweet: (characterId: string, sweetType: SweetType) => void;
  onClick: (characterId: string) => void;
}

export const Character: React.FC<CharacterProps> = ({
  character,
  onDropCracker,
  onDropSweet,
  onClick
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const crackerType = e.dataTransfer.getData('application/cracker');
    const sweetType = e.dataTransfer.getData('application/sweet') as SweetType;

    if (crackerType) {
      onDropCracker(character.id, crackerType);
    } else if (sweetType) {
      onDropSweet(character.id, sweetType);
    }
  };

  const isWalking = character.state === 'walking';
  const isIgniting = character.state === 'igniting';
  const isRunningBack = character.state === 'running_back';
  const isCoveringEars = character.state === 'covering_ears';
  const isCelebrating = character.state === 'celebrating';
  const isEatingSweet = character.state === 'sweets';

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => onClick(character.id)}
      className="absolute cursor-pointer select-none group touch-none"
      style={{
        left: `${character.xPercent}%`,
        top: `${character.yPercent}%`,
        transform: 'translate(-50%, -90%)',
        zIndex: Math.floor(character.yPercent * 10)
      }}
    >
      {/* Authentic Hindi/English Speech Bubble */}
      <AnimatePresence>
        {character.speechBubble && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            className={`absolute -top-20 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap px-3.5 py-1.5 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none flex items-center gap-1.5 text-xs font-semibold ${
              isRunningBack || isCoveringEars
                ? 'bg-rose-950/95 border border-rose-500/80 text-rose-200 shadow-rose-500/25 animate-pulse'
                : 'bg-zinc-950/95 border border-amber-500/70 text-amber-200 shadow-amber-500/15'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{character.speechBubble.text}</span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-950" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sweets Celebration Hearts & Blessings */}
      <AnimatePresence>
        {isEatingSweet && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1 text-rose-400 pointer-events-none"
          >
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-bounce" />
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-[11px] text-amber-300 font-festive font-bold">धन्यवाद!</span>
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-bounce delay-100" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Realistic Terrace Shadow & Diya Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black/60 rounded-full blur-md" />
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-16 h-3 bg-amber-500/25 rounded-full blur-sm" />

      {/* Main Character Body & Portrait */}
      <motion.div
        animate={
          isIgniting
            ? { y: [0, 24, 24], scale: [1, 0.92, 0.92] } // Deep knee bend / crouching to reach fuse
            : isRunningBack
            ? { x: character.direction === 'right' ? [-25, 0] : [25, 0], y: [0, -10, 0], rotate: character.direction === 'right' ? -12 : 12 } // Quick dash back
            : isCoveringEars
            ? { y: [0, 4, 0], scale: [1, 0.98, 1] } // Ducking with hands on ears
            : isCelebrating
            ? { y: [0, -22, 0], scale: [1, 1.06, 1] } // Jumping and cheering
            : isWalking
            ? { y: [0, -8, 0], rotate: [-3, 3, -3] }
            : { y: [0, -3, 0] } // Gentle breathing idle
        }
        transition={{
          duration: isRunningBack ? 0.35 : isWalking ? 0.45 : isCelebrating ? 0.55 : 2.5,
          repeat: isIgniting || isCoveringEars ? 0 : Infinity,
          ease: 'easeInOut'
        }}
        className="relative flex flex-col items-center"
      >
        {/* Photorealistic Face Portrait with authentic lighting */}
        <div className="relative">
          <div
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 ${character.accentBg} shadow-xl shadow-black/90 relative z-10 transition-transform group-hover:scale-105`}
          >
            <AvatarImage
              src={character.avatarUrl}
              name={character.name}
              characterId={character.id}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Golden Tilak on forehead */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B] z-20" />
        </div>

        {/* Traditional Indian Festive Attire Body */}
        {(() => {
          const isFemale = character.gender === 'female' || character.id === 'priya' || character.id === 'ananya';

          if (isFemale) {
            return (
              <div className="relative -mt-2.5 z-0 flex flex-col items-center">
                {/* Female Choli Blouse & Zari Dupatta Drape */}
                <div
                  className={`w-13 h-14 md:w-15 md:h-17 rounded-t-xl bg-gradient-to-b ${character.outfitColor} shadow-md border-t-2 border-amber-300 relative flex justify-center overflow-hidden`}
                >
                  {/* Sweetheart golden neckline */}
                  <div className="absolute top-1.5 w-7 h-2.5 rounded-b-full border-b-2 border-amber-300/90 bg-amber-950/20" />

                  {/* Graceful Diagonal Zari Dupatta Drape from left shoulder */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-300/35 to-amber-200/50 -rotate-12 translate-x-1" />
                  <div className="absolute right-2 top-0 bottom-0 w-1 bg-amber-300/80 shadow-[0_0_6px_rgba(253,224,71,0.7)]" />

                  {/* Left Arm with Golden & Crimson Bangles (Choodiyan) */}
                  <motion.div
                    animate={
                      isCoveringEars
                        ? { rotate: [-140, -145, -140], y: -16, x: 8 }
                        : isEatingSweet
                        ? { rotate: [-45, -50, -45], y: -10, x: 4 }
                        : isCelebrating
                        ? { rotate: [-40, -50, -40], y: -10 }
                        : isIgniting
                        ? { rotate: [15, 25, 15], y: 14 }
                        : { rotate: [0, 5, 0] }
                    }
                    className="absolute -left-2 top-2 w-3.5 h-12 rounded-full bg-gradient-to-b from-amber-600 to-amber-700 origin-top shadow-sm flex flex-col justify-end items-center pb-1"
                  >
                    {/* Golden Bangles */}
                    <div className="w-3.5 h-1 bg-amber-300 rounded-sm shadow-[0_0_4px_#FDE047]" />
                    <div className="w-3 h-0.5 bg-rose-500 rounded-sm" />
                  </motion.div>

                  {/* Right Arm with Bangles & Agarbatti */}
                  <motion.div
                    animate={
                      isCoveringEars
                        ? { rotate: [140, 145, 140], y: -16, x: -8 }
                        : isEatingSweet
                        ? { rotate: [45, 50, 45], y: -10, x: -4 }
                        : isCelebrating
                        ? { rotate: [40, 55, 40], y: -10 }
                        : isIgniting
                        ? { rotate: [-20, -55, -20], y: 16 }
                        : { rotate: [0, -5, 0] }
                    }
                    className="absolute -right-2 top-2 w-3.5 h-12 rounded-full bg-gradient-to-b from-amber-600 to-amber-700 origin-top shadow-sm flex flex-col justify-end items-center pb-1"
                  >
                    {/* Golden Bangles on right wrist */}
                    <div className="w-3.5 h-1 bg-amber-300 rounded-sm shadow-[0_0_4px_#FDE047]" />
                    <div className="w-3 h-0.5 bg-rose-500 rounded-sm" />

                    {/* Glowing Agarbatti stick */}
                    {!isCoveringEars && !isEatingSweet && (
                      <div className="absolute -bottom-5 -right-3 w-1 h-14 bg-amber-900/90 rotate-45 origin-bottom flex flex-col justify-start items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#EF4444] animate-ping" />
                        <div className="w-1 h-3 bg-zinc-300/40 rounded-full blur-[1px] -mt-1" />
                      </div>
                    )}

                    {character.holdingSparkler && (
                      <div className="absolute -bottom-4 -right-3 w-1.5 h-16 bg-zinc-300 rotate-45 origin-bottom">
                        <div className="w-3.5 h-3.5 rounded-full bg-yellow-200 shadow-[0_0_16px_#FDE047] animate-ping" />
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Waistband (Kamarbandh) */}
                <div className="w-14 md:w-16 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 shadow-sm z-10 -mt-0.5 relative flex justify-end pr-1">
                  {/* Decorative hanging tassel (Latkan) */}
                  <div className="w-1 h-4 bg-amber-300 rounded-full shadow-[0_0_4px_#FDE047]" />
                </div>

                {/* Flared Pleated Royal Lehenga Skirt */}
                <div className={`w-16 h-15 md:w-20 md:h-18 bg-gradient-to-b ${character.outfitColor} rounded-b-2xl shadow-lg border-b-4 border-amber-300 relative overflow-hidden flex justify-around`}>
                  {/* Pleat lines and zari shimmer */}
                  <div className="w-0.5 h-full bg-black/20" />
                  <div className="w-0.5 h-full bg-amber-300/30" />
                  <div className="w-0.5 h-full bg-black/20" />
                  <div className="w-0.5 h-full bg-amber-300/30" />
                  <div className="w-0.5 h-full bg-black/20" />

                  {/* Heavy Gota Patti Gold Border at bottom hem */}
                  <div className="absolute bottom-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 opacity-90 shadow-inner" />
                </div>

                {/* Delicate Festive Mojdis / Footwear */}
                <div className="flex gap-2.5 -mt-0.5">
                  <div className="w-3.5 h-2 bg-amber-500 rounded-b-full border-t border-amber-300 shadow-sm" />
                  <div className="w-3.5 h-2 bg-amber-500 rounded-b-full border-t border-amber-300 shadow-sm" />
                </div>
              </div>
            );
          }

          // Male Kurta & Pyjama Attire
          return (
            <div className="relative -mt-2.5 z-0 flex flex-col items-center">
              {/* Shoulders & Torso */}
              <div
                className={`w-14 h-16 md:w-16 md:h-20 rounded-t-xl bg-gradient-to-b ${character.outfitColor} shadow-md border-t border-amber-300/40 relative flex justify-center`}
              >
                {/* Zari Gold Placket pattern */}
                <div className="w-1.5 h-full bg-amber-300/60 shadow-[0_0_4px_rgba(253,224,71,0.5)]" />
                <div className="absolute top-2 w-8 h-3 rounded-full border-t border-amber-300/80" />

                {/* Left Arm */}
                <motion.div
                  animate={
                    isCoveringEars
                      ? { rotate: [-140, -145, -140], y: -16, x: 8 }
                      : isEatingSweet
                      ? { rotate: [-45, -50, -45], y: -10, x: 4 }
                      : isCelebrating
                      ? { rotate: [-40, -50, -40], y: -10 }
                      : isIgniting
                      ? { rotate: [15, 25, 15], y: 14 }
                      : { rotate: [0, 5, 0] }
                  }
                  className="absolute -left-2 top-2 w-3.5 h-12 rounded-full bg-gradient-to-b from-amber-600 to-amber-700 origin-top shadow-sm"
                />

                {/* Right Arm */}
                <motion.div
                  animate={
                    isCoveringEars
                      ? { rotate: [140, 145, 140], y: -16, x: -8 }
                      : isEatingSweet
                      ? { rotate: [45, 50, 45], y: -10, x: -4 }
                      : isCelebrating
                      ? { rotate: [40, 55, 40], y: -10 }
                      : isIgniting
                      ? { rotate: [-20, -55, -20], y: 16 }
                      : { rotate: [0, -5, 0] }
                  }
                  className="absolute -right-2 top-2 w-3.5 h-12 rounded-full bg-gradient-to-b from-amber-600 to-amber-700 origin-top shadow-sm flex items-end justify-center"
                >
                  {!isCoveringEars && !isEatingSweet && (
                    <div className="absolute -bottom-5 -right-3 w-1 h-14 bg-amber-900/90 rotate-45 origin-bottom flex flex-col justify-start items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#EF4444] animate-ping" />
                      <div className="w-1 h-3 bg-zinc-300/40 rounded-full blur-[1px] -mt-1" />
                    </div>
                  )}

                  {character.holdingSparkler && (
                    <div className="absolute -bottom-4 -right-3 w-1.5 h-16 bg-zinc-300 rotate-45 origin-bottom">
                      <div className="w-3.5 h-3.5 rounded-full bg-yellow-200 shadow-[0_0_16px_#FDE047] animate-ping" />
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Lower Pyjama / Dhoti */}
              <div className="w-12 h-14 md:w-14 md:h-16 bg-gradient-to-b from-amber-100 to-amber-200 rounded-b-md shadow-md border-t border-amber-400/40 relative">
                <div className="w-0.5 h-full mx-auto bg-amber-400/50" />
              </div>

              {/* Traditional Jutti Shoes */}
              <div className="flex gap-2 -mt-1">
                <div className="w-4 h-2.5 bg-amber-700 rounded-b-full border-t border-amber-400" />
                <div className="w-4 h-2.5 bg-amber-700 rounded-b-full border-t border-amber-400" />
              </div>
            </div>
          );
        })()}

        {/* Real Name Tag with relation */}
        <div className="mt-2 px-2.5 py-0.5 bg-zinc-950/85 border border-amber-500/40 rounded-full text-[11px] font-medium text-amber-200 shadow-md backdrop-blur-sm flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-semibold text-white">{character.name}</span>
          <span className="text-[9px] text-zinc-500">·</span>
          <span className="text-[10px] text-amber-300/90">{character.relation}</span>
        </div>
      </motion.div>
    </div>
  );
};
