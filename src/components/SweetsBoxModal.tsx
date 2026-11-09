import React, { useState } from 'react';
import { SWEET_DEFINITIONS } from '../data/constants';
import { SweetType, CharacterData } from '../types';
import { X, Sparkles, Heart, Gift, Check, Smile } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface SweetsBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareSweet: (sweetType: SweetType) => void;
  sweetsDistributedCount: number;
  characters?: CharacterData[];
}

export const SweetsBoxModal: React.FC<SweetsBoxModalProps> = ({
  isOpen,
  onClose,
  onShareSweet,
  sweetsDistributedCount,
  characters = []
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/50 rounded-3xl shadow-2xl shadow-amber-500/20 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Ornate Header */}
        <div className="relative px-6 py-5 border-b border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Gift className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-festive tracking-wide">
                  Diwali Mithai Dabba
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono">
                  {sweetsDistributedCount} Shared
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Traditional festive sweets and blessings to celebrate Diwali
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Sweets Grid */}
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Select Traditional Festive Sweet
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {sweetList.map((sweet) => {
                const isSelected = selectedSweet === sweet.type;

                return (
                  <button
                    key={sweet.type}
                    onClick={() => setSelectedSweet(sweet.type)}
                    className={`relative p-3 rounded-2xl border cursor-pointer transition-all flex flex-col items-center text-center select-none ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/10 scale-105'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50'
                    }`}
                  >
                    {/* Sweet Visual Icon */}
                    <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center text-2xl shadow-inner mb-2 border border-zinc-800">
                      {sweet.type === 'kaju_katli' && (
                        <div className="w-7 h-7 rotate-45 bg-gradient-to-tr from-slate-200 to-white shadow-sm border border-slate-300 flex items-center justify-center text-[10px] text-zinc-600 font-serif">
                          ✦
                        </div>
                      )}
                      {sweet.type === 'motichoor_ladoo' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-md flex items-center justify-center text-xs text-amber-950 font-bold">
                          ●
                        </div>
                      )}
                      {sweet.type === 'gulab_jamun' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-900 to-rose-900 shadow-md border border-rose-950 flex items-center justify-center text-xs text-amber-300">
                          ◉
                        </div>
                      )}
                      {sweet.type === 'jalebi' && (
                        <div className="w-8 h-8 rounded-full border-4 border-amber-400 bg-amber-500/20 shadow-md flex items-center justify-center text-xs text-amber-300 font-bold">
                          ◎
                        </div>
                      )}
                      {sweet.type === 'besan_barfi' && (
                        <div className="w-7 h-7 rounded-sm bg-gradient-to-tr from-yellow-600 to-amber-400 shadow-md border border-amber-300/40 flex items-center justify-center text-[10px] text-amber-950 font-bold">
                          ◼
                        </div>
                      )}
                    </div>

                    <span className="text-xs font-semibold text-zinc-100">
                      {sweet.name}
                    </span>
                    <span className="text-[10px] text-amber-400/90 font-festive">
                      {sweet.hindiName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Sweet Details Box */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-amber-300">
                {activeSweet.name} ({activeSweet.hindiName})
              </span>
              <span className="text-[11px] text-zinc-400">
                {activeSweet.ingredients}
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {activeSweet.description}
            </p>
            <div className="pt-2 border-t border-zinc-800/60 flex items-center gap-2 text-xs text-amber-400/90 italic">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>"{activeSweet.blessing}"</span>
            </div>
          </div>

          {/* Heartfelt Gratitude Section when Mithai is shared */}
          {justShared && (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-500/15 via-zinc-900 to-zinc-950 border border-amber-400/50 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300 font-festive">
                    Everyone's Heartfelt Thanks! (सबका बहुत-बहुत धन्यवाद 🙏)
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-medium">Sweet Received!</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {(characters.length > 0 ? characters : [
                  { id: '1', name: 'Aarav', relation: 'Celebration Host', avatarUrl: '/src/assets/images/festive_aarav_portrait_1794199836165.jpg' },
                  { id: '2', name: 'Priya', relation: 'Diya Lighting Artist', avatarUrl: '/src/assets/images/festive_priya_portrait_1794199836439.jpg' },
                  { id: '3', name: 'Kabir', relation: 'Pyrotechnic Enthusiast', avatarUrl: '/src/assets/images/festive_kabir_portrait_1794199837314.jpg' },
                  { id: '4', name: 'Ananya', relation: 'Sweets & Rangoli Curator', avatarUrl: '/src/assets/images/festive_ananya_portrait_1794199838788.jpg' }
                ]).map((char, idx) => {
                  const thankNotes = [
                    `Dhanyawad! Bohot swadisht ${activeSweet.name} thi! Shubh Deepavali! 🙏`,
                    `Thank you so much! May your home be filled with endless sweetness! 🪔`,
                    `Wah! Maza aa gaya, shukriya mere bhai! Happy Diwali! ✨`,
                    `Arey waah, thank you for sharing the sweet love! Shubh Deepavali! 🍬`
                  ];

                  return (
                    <div
                      key={char.id}
                      className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex items-start gap-2.5 shadow-sm"
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-400/80 shrink-0 shadow-sm">
                        <img
                          src={char.avatarUrl}
                          alt={char.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-white truncate">{char.name}</span>
                          <span className="text-[9px] text-amber-300/80 truncate">({char.relation})</span>
                        </div>
                        <p className="text-[11px] text-zinc-300 leading-snug mt-0.5 italic">
                          "{thankNotes[idx % thankNotes.length]}"
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Share Action */}
          <div className="pt-2 flex flex-col items-center gap-3">
            <button
              onClick={handleShare}
              className={`w-full py-3 px-6 rounded-2xl text-xs font-bold tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-xl ${
                justShared
                  ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-black shadow-amber-500/25 hover:scale-[1.02]'
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
                  <span>Share {activeSweet.name} with Everyone (मिठाई बाँटें)</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white rounded-xl transition-colors"
            >
              Return to Celebration Arena
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
