import React, { useState } from 'react';
import { CRACKER_DEFINITIONS } from '../data/constants';
import { CrackerType } from '../types';
import { Sparkles, Disc, Flame, Wand2, Rocket, Layers, Gift, Check, X } from 'lucide-react';

interface InventoryDockProps {
  selectedCracker?: CrackerType | null;
  onSelectCracker: (type: CrackerType | null) => void;
  onOpenSweetsBox: () => void;
  onTriggerGrandFinale: () => void;
}

export const InventoryDock: React.FC<InventoryDockProps> = ({
  selectedCracker,
  onSelectCracker,
  onOpenSweetsBox,
  onTriggerGrandFinale
}) => {
  const [hoveredCracker, setHoveredCracker] = useState<CrackerType | null>(null);

  const crackerList = Object.values(CRACKER_DEFINITIONS);

  const getCrackerIcon = (type: CrackerType, isSelected: boolean) => {
    switch (type) {
      case 'charkhi':
        return (
          <Disc
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-500 ${
              isSelected ? 'text-amber-300 animate-spin' : 'text-amber-400 group-hover:rotate-180'
            }`}
          />
        );
      case 'anar':
        return (
          <Flame
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
              isSelected ? 'text-pink-300 scale-125 animate-pulse' : 'text-pink-400 group-hover:scale-110'
            }`}
          />
        );
      case 'phooljhadi':
        return (
          <Wand2
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
              isSelected ? 'text-sky-300 -rotate-12 scale-125' : 'text-sky-400 group-hover:-rotate-12'
            }`}
          />
        );
      case 'rocket':
        return (
          <Rocket
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
              isSelected ? 'text-rose-300 -translate-y-1 scale-125 animate-bounce' : 'text-rose-400 group-hover:-translate-y-1'
            }`}
          />
        );
      case 'skyshot':
        return (
          <Layers
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
              isSelected ? 'text-purple-300 scale-125' : 'text-purple-400 group-hover:scale-110'
            }`}
          />
        );
      case 'sky_letters':
        return (
          <Sparkles
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
              isSelected ? 'text-amber-200 scale-125 animate-pulse' : 'text-amber-300 group-hover:scale-125'
            }`}
          />
        );
    }
  };

  const handleDragStart = (e: React.DragEvent, type: CrackerType) => {
    e.dataTransfer.setData('application/cracker', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCardClick = (e: React.MouseEvent, type: CrackerType) => {
    // Crucial: Stop event bubbling so arena's handleFloorClick does NOT immediately catch this click!
    e.stopPropagation();
    if (selectedCracker === type) {
      onSelectCracker(null);
    } else {
      onSelectCracker(type);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 max-w-5xl w-[96%] px-2 sm:px-4 py-2 bg-zinc-950/94 backdrop-blur-md border border-amber-500/40 rounded-2xl shadow-2xl shadow-black/95 flex flex-row items-center justify-between gap-1.5 sm:gap-3"
    >
      {/* Left: Mithai Dabba Quick Launch */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenSweetsBox();
        }}
        className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/50 rounded-xl text-amber-300 text-xs font-semibold tracking-wide transition-all shadow-md group shrink-0 whitespace-nowrap active:scale-95 cursor-pointer"
        title="Open Sweets Box & Share with Family"
      >
        <Gift className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">Mithai Dabba</span>
        <span className="sm:hidden text-[11px]">Mithai</span>
      </button>

      {/* Center: The Fireworks Selection Shelf */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto py-1 px-1 flex-1 justify-start scrollbar-none">
        {crackerList.map((cracker) => {
          const isSelected = selectedCracker === cracker.type;
          const isHovered = hoveredCracker === cracker.type;
          const isCharkhi = cracker.type === 'charkhi';

          return (
            <button
              type="button"
              key={cracker.type}
              draggable
              onDragStart={(e) => handleDragStart(e, cracker.type)}
              onClick={(e) => handleCardClick(e, cracker.type)}
              onMouseEnter={() => setHoveredCracker(cracker.type)}
              onMouseLeave={() => setHoveredCracker(null)}
              aria-pressed={isSelected}
              className={`relative group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 min-w-[110px] sm:min-w-[126px] rounded-xl cursor-pointer select-none transition-all duration-150 shrink-0 text-left focus:outline-none ${
                isSelected
                  ? 'bg-amber-500/35 border-2 border-amber-300 ring-4 ring-amber-400/80 shadow-[0_0_22px_rgba(245,158,11,0.7)] scale-[1.04] -translate-y-1'
                  : isCharkhi
                  ? 'bg-amber-500/15 border border-amber-400/80 shadow-md shadow-amber-500/10 hover:border-amber-300 hover:bg-amber-500/25 hover:-translate-y-0.5'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/70 hover:border-amber-400/80 hover:shadow-amber-500/10 hover:-translate-y-0.5'
              }`}
            >
              {/* Selected Floating Pill Badge with Checkmark */}
              {isSelected && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-black text-[9px] font-black uppercase tracking-wider shadow-lg flex items-center gap-0.5 z-30 animate-pulse whitespace-nowrap">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  <span>Selected</span>
                </div>
              )}

              {/* Icon Container */}
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? 'bg-amber-950 border border-amber-300 shadow-[0_0_10px_#F59E0B]'
                    : isCharkhi
                    ? 'bg-amber-950/80 border border-amber-400/80'
                    : 'bg-zinc-950/80 border border-zinc-800'
                }`}
              >
                {getCrackerIcon(cracker.type, isSelected)}
              </div>

              {/* Text info */}
              <div className="flex flex-col text-left whitespace-nowrap pr-1 leading-tight">
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[11px] sm:text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'text-amber-100 font-bold'
                        : isCharkhi
                        ? 'text-amber-300'
                        : 'text-zinc-100 group-hover:text-amber-300'
                    }`}
                  >
                    {cracker.name}
                  </span>
                  {isCharkhi && !isSelected && (
                    <span className="text-[9px] px-1 py-0.2 bg-amber-400/20 text-amber-300 rounded font-bold hidden sm:inline">
                      Spin
                    </span>
                  )}
                </div>
                <span className={`text-[9px] sm:text-[10px] ${isSelected ? 'text-amber-200 font-medium' : 'text-zinc-400'}`}>
                  {isSelected ? 'Tap to place' : `${cracker.hindiName} · ${cracker.durationSeconds}s`}
                </span>
              </div>

              {/* Tooltip on hover if not selected */}
              {isHovered && !isSelected && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-950 border border-amber-500/60 text-[10px] text-amber-200 px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap pointer-events-none z-50">
                  Tap to place on floor
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected cracker cancel button if active */}
      {selectedCracker && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectCracker(null);
          }}
          className="p-1.5 sm:px-2 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 rounded-xl text-[11px] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
          title="Cancel Cracker Selection"
        >
          <X className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Cancel</span>
        </button>
      )}

      {/* Right: Grand Finale Dhamaka */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onTriggerGrandFinale();
        }}
        className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold tracking-wide rounded-xl shadow-lg shadow-rose-600/25 transition-all hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap cursor-pointer"
        title="Ignite Grand Finale Fireworks Display"
      >
        <Sparkles className="w-3.5 h-3.5 fill-white" />
        <span className="hidden sm:inline">Grand Dhamaka</span>
        <span className="sm:hidden text-[11px]">Dhamaka</span>
      </button>
    </div>
  );
};
