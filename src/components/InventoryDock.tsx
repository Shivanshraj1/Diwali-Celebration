import React, { useState } from 'react';
import { CRACKER_DEFINITIONS } from '../data/constants';
import { CrackerType } from '../types';
import { Sparkles, Disc, Flame, Wand2, Rocket, Layers, Gift } from 'lucide-react';

interface InventoryDockProps {
  onSelectCracker: (type: CrackerType) => void;
  onOpenSweetsBox: () => void;
  onTriggerGrandFinale: () => void;
}

export const InventoryDock: React.FC<InventoryDockProps> = ({
  onSelectCracker,
  onOpenSweetsBox,
  onTriggerGrandFinale
}) => {
  const [hoveredCracker, setHoveredCracker] = useState<CrackerType | null>(null);

  const crackerList = Object.values(CRACKER_DEFINITIONS);

  const getCrackerIcon = (type: CrackerType) => {
    switch (type) {
      case 'charkhi':
        return <Disc className="w-5 h-5 text-amber-400 group-hover:rotate-180 transition-transform duration-500" />;
      case 'anar':
        return <Flame className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />;
      case 'phooljhadi':
        return <Wand2 className="w-5 h-5 text-sky-400 group-hover:-rotate-12 transition-transform" />;
      case 'rocket':
        return <Rocket className="w-5 h-5 text-rose-400 group-hover:-translate-y-1 transition-transform" />;
      case 'skyshot':
        return <Layers className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />;
      case 'sky_letters':
        return <Sparkles className="w-5 h-5 text-amber-300 group-hover:scale-125 transition-transform" />;
    }
  };

  const handleDragStart = (e: React.DragEvent, type: CrackerType) => {
    e.dataTransfer.setData('application/cracker', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-6xl w-[96%] px-3 sm:px-5 py-2.5 bg-zinc-950/92 backdrop-blur-md border border-amber-500/35 rounded-2xl shadow-2xl shadow-black/80 flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Left: Mithai Dabba Quick Launch */}
      <button
        onClick={onOpenSweetsBox}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/40 rounded-xl text-amber-300 text-xs font-semibold tracking-wide transition-all shadow-md group shrink-0 whitespace-nowrap"
      >
        <Gift className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
        <span>Mithai Dabba</span>
      </button>

      {/* Center: The Drag-and-Drop Crackers with Charkhi highlighted & guaranteed left visibility */}
      <div className="flex items-center gap-2.5 overflow-x-auto py-1 px-2 w-full md:flex-1 justify-start scrollbar-none">
        {crackerList.map((cracker) => {
          const isHovered = hoveredCracker === cracker.type;
          const isCharkhi = cracker.type === 'charkhi';

          return (
            <div
              key={cracker.type}
              draggable
              onDragStart={(e) => handleDragStart(e, cracker.type)}
              onClick={() => onSelectCracker(cracker.type)}
              onMouseEnter={() => setHoveredCracker(cracker.type)}
              onMouseLeave={() => setHoveredCracker(null)}
              className={`relative group flex items-center gap-2 px-3 py-2 min-w-[124px] rounded-xl cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5 hover:shadow-lg shrink-0 select-none ${
                isCharkhi
                  ? 'bg-amber-500/15 border border-amber-400 shadow-md shadow-amber-500/10 hover:border-amber-300'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/70 hover:border-amber-400/80 hover:shadow-amber-500/10'
              }`}
            >
              {/* Icon */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isCharkhi ? 'bg-amber-950/80 border border-amber-400/80' : 'bg-zinc-950/80 border border-zinc-800'
              }`}>
                {getCrackerIcon(cracker.type)}
              </div>

              {/* Text info with whitespace-nowrap preventing clipping */}
              <div className="flex flex-col text-left whitespace-nowrap pr-1 leading-tight">
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-semibold transition-colors ${isCharkhi ? 'text-amber-300' : 'text-zinc-100 group-hover:text-amber-300'}`}>
                    {cracker.name}
                  </span>
                  {isCharkhi && (
                    <span className="text-[9px] px-1 py-0.2 bg-amber-400/20 text-amber-300 rounded font-bold">
                      Spin
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-zinc-400">
                  {cracker.hindiName} · {cracker.durationSeconds}s
                </span>
              </div>

              {/* Drag tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-950 border border-amber-500/60 text-[10px] text-amber-200 px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap pointer-events-none z-50">
                  Drag onto ground or tap to place
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right: Grand Finale Dhamaka */}
      <button
        onClick={onTriggerGrandFinale}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold tracking-wide rounded-xl shadow-lg shadow-rose-600/25 transition-all hover:scale-105 shrink-0 whitespace-nowrap"
      >
        <Sparkles className="w-3.5 h-3.5 fill-white" />
        <span>Grand Dhamaka</span>
      </button>
    </div>
  );
};
