import React, { useState } from 'react';
import { SWEET_DEFINITIONS } from '../data/constants';
import { SweetType, CharacterData } from '../types';
import { X, Sparkles, Heart, Gift, Check, Smile } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { AvatarImage } from './AvatarImage';

interface SweetsBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareSweet: (sweetType: SweetType) => void;
  sweetsDistributedCount: number;
  characters: CharacterData[];
}

export const SweetsBoxModal: React.FC<SweetsBoxModalProps> = ({
  isOpen,
  onClose,
  onShareSweet,
  sweetsDistributedCount,
  characters
}) => {
  const [selectedSweet, setSelectedSweet] = useState<SweetType>('kaju_katli');
  const [justShared, setJustShared] = useState(false);

  if (!isOpen) return null;

  const sweetList = Object.values(SWEET_DEFINITIONS);
  const activeSweet = SWEET_DEFINITIONS[selectedSweet];

  const handleShare = () => {
    soundEngine.playSweetCheer();
    onShareSweet(selectedSweet);
    setJustShared(true);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-2.5 sm:p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/50 rounded-3xl shadow-2xl shadow-amber-500/20 overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="relative px-4 sm:px-6 py-4 border-b border-zinc-800 bg-zinc-950/80 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white font-festive tracking-wide">
                  Diwali Mithai Dabba
                </h3>
                <span className="text-[11px] text-amber-300 font-mono">
                  · {sweetsDistributedCount} Shared
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate">
                Share traditional sweets with online friends in your room
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Mithai Dabba"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Select Traditional Festive Sweet
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
              {sweetList.map((sweet) => {
                const isSelected = selectedSweet === sweet.type;

                return (
                  <button
                    key={sweet.type}
                    type="button"
                    onClick={() => setSelectedSweet(sweet.type)}
                    className={`min-h-[88px] relative p-3 rounded-2xl border cursor-pointer transition-all flex flex-col items-center text-center select-none ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/10'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-zinc-950 flex items-center justify-center text-xl shadow-inner mb-2 border border-zinc-800">
                      {sweet.type === 'kaju_katli' && (
                        <div className="w-6 h-6 rotate-45 bg-gradient-to-tr from-slate-200 to-white shadow-sm border border-slate-300 flex items-center justify-center text-[10px] text-zinc-600 font-serif">
                          ✦
                        </div>
                      )}
                      {sweet.type === 'motichoor_ladoo' && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-md flex items-center justify-center text-xs text-amber-950 font-bold">
                          ●
                        </div>
                      )}
                      {sweet.type === 'gulab_jamun' && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-900 to-rose-900 shadow-md border border-rose-950 flex items-center justify-center text-xs text-amber-300">
                          ◉
                        </div>
                      )}
                      {sweet.type === 'jalebi' && (
                        <div className="w-7 h-7 rounded-full border-4 border-amber-400 bg-amber-500/20 shadow-md flex items-center justify-center text-xs text-amber-300 font-bold">
                          ◎
                        </div>
                      )}
                      {sweet.type === 'besan_barfi' && (
                        <div className="w-6 h-6 rounded-sm bg-gradient-to-tr from-yellow-600 to-amber-400 shadow-md border border-amber-300/40 flex items-center justify-center text-[10px] text-amber-950 font-bold">
                          ◼
                        </div>
                      )}
                    </div>

                    <span className="text-xs font-semibold text-zinc-100">{sweet.name}</span>
                    <span className="text-[10px] text-amber-400/90 font-festive">{sweet.hindiName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Box */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-sm font-bold text-amber-300">
                {activeSweet.name} ({activeSweet.hindiName})
              </span>
              <span className="text-[11px] text-zinc-400">{activeSweet.ingredients}</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">{activeSweet.description}</p>
            <div className="pt-2 border-t border-zinc-800/60 flex items-center gap-2 text-xs text-amber-400/90 italic">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>&ldquo;{activeSweet.blessing}&rdquo;</span>
            </div>
          </div>

          {justShared && characters.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-500/15 via-zinc-900 to-zinc-950 border border-amber-400/50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300 font-festive">
                    Shared with {characters.length} online {characters.length === 1 ? 'celebrator' : 'friends'}!
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-40 overflow-y-auto pr-1">
                {characters.map((char) => (
                  <div
                    key={char.id}
                    className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex items-center gap-2.5"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-400/80 shrink-0">
                      <AvatarImage
                        src={char.avatarUrl}
                        name={char.name}
                        characterId={char.id}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{char.name}</div>
                      <div className="text-[11px] text-amber-300/85 truncate">
                        Received {activeSweet.name} 🍬
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share Action */}
          <div className="pt-1 flex flex-col items-center gap-2.5">
            <button
              type="button"
              onClick={handleShare}
              className={`w-full min-h-[48px] py-3 px-6 rounded-2xl text-xs font-bold tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
                justShared
                  ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-black shadow-amber-500/25'
              }`}
            >
              {justShared ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>मिठाई बाँटी गई! Share Another Piece</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-black" />
                  <span>Share {activeSweet.name} Live</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Return to Celebration Arena
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
