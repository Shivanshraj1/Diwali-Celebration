import React, { useState } from 'react';
import { CRACKER_DEFINITIONS } from '../data/constants';
import { CrackerType } from '../types';
import {
  Sparkles,
  Disc,
  Flame,
  Wand2,
  Rocket,
  Layers,
  Gift,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Zap,
  Volume2,
  MessageCircle,
  PartyPopper
} from 'lucide-react';

interface InventoryDockProps {
  selectedCracker: CrackerType | null;
  onSelectCracker: (type: CrackerType | null) => void;
  onQuickIgniteSelected: (type: CrackerType) => void;
  onOpenSweetsBox: () => void;
  onTriggerGrandFinale: () => void;
  isSoundboardOpen: boolean;
  onToggleSoundboard: () => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  unreadChatCount: number;
  onShareJoy: () => void;
  shareJoyCooldown?: boolean;
  soundboardSlot?: React.ReactNode;
}

export const InventoryDock: React.FC<InventoryDockProps> = ({
  selectedCracker,
  onSelectCracker,
  onQuickIgniteSelected,
  onOpenSweetsBox,
  onTriggerGrandFinale,
  isSoundboardOpen,
  onToggleSoundboard,
  isChatOpen,
  onToggleChat,
  unreadChatCount,
  onShareJoy,
  shareJoyCooldown = false,
  soundboardSlot
}) => {
  const [isExpandedDrawer, setIsExpandedDrawer] = useState(false);

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
              isSelected ? 'text-rose-300 -translate-y-0.5 scale-125 animate-bounce' : 'text-rose-400 group-hover:-translate-y-0.5'
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

  const handleCardSelect = (e: React.SyntheticEvent, type: CrackerType) => {
    e.stopPropagation();
    if (selectedCracker === type) {
      onQuickIgniteSelected(type);
    } else {
      onSelectCracker(type);
      setIsExpandedDrawer(false);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      className="fixed bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-6xl pb-[env(safe-area-inset-bottom)] flex flex-col items-center gap-1.5"
    >
      {/* Soundboard Popover Slot */}
      {soundboardSlot}

      {/* Mobile-Friendly Quick-Burst Helper Strip when a cracker is selected */}
      {selectedCracker && (
        <div className="w-full max-w-md px-3 py-1.5 rounded-2xl bg-zinc-950/95 border border-amber-400/70 shadow-[0_8px_28px_rgba(245,158,11,0.35)] flex items-center justify-between gap-2 backdrop-blur-xl">
          <span className="text-[11px] sm:text-xs font-semibold text-amber-200 truncate">
            {CRACKER_DEFINITIONS[selectedCracker].name}: tap courtyard or ignite now
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickIgniteSelected(selectedCracker);
              }}
              className="min-h-[36px] px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-black text-xs font-extrabold flex items-center gap-1 shadow-md active:scale-95 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>Light Here</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectCracker(null);
              }}
              aria-label="Cancel cracker selection"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Expandable Cracker Grid Drawer for effortless one-thumb mobile selection */}
      {isExpandedDrawer && (
        <div className="w-full p-2.5 rounded-2xl bg-zinc-950/96 border border-amber-500/45 shadow-2xl backdrop-blur-xl grid grid-cols-2 sm:grid-cols-3 gap-2">
          {crackerList.map((cracker) => {
            const isSelected = selectedCracker === cracker.type;
            return (
              <button
                key={cracker.type}
                type="button"
                onClick={(e) => handleCardSelect(e, cracker.type)}
                className={`min-h-[54px] px-3 py-2 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer active:scale-[0.98] ${
                  isSelected
                    ? 'bg-amber-500/30 border-amber-300 ring-2 ring-amber-400/70'
                    : 'bg-zinc-900 border-zinc-800 hover:border-amber-400/60'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                  {getCrackerIcon(cracker.type, isSelected)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{cracker.name}</div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    {cracker.hindiName} · {cracker.durationSeconds}s
                  </div>
                </div>
              </button>
            );
          })}
          <div className="sm:hidden col-span-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpandedDrawer(false);
                onOpenSweetsBox();
              }}
              className="min-h-[44px] px-3 py-2 rounded-xl border border-amber-400/40 bg-amber-500/15 text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Gift className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Mithai Dabba</span>
            </button>
            <button
              type="button"
              disabled={shareJoyCooldown}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpandedDrawer(false);
                onShareJoy();
              }}
              className="min-h-[44px] px-3 py-2 rounded-xl border border-pink-400/50 bg-gradient-to-r from-pink-500/25 via-amber-500/25 to-yellow-500/25 disabled:opacity-60 text-amber-100 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PartyPopper className="w-4 h-4 text-pink-300 shrink-0" />
              <span>Share Joy</span>
            </button>
          </div>
        </div>
      )}

      {/* Compact Main Bottom Dock */}
      <div className="w-full px-1.5 sm:px-3 py-1.5 bg-zinc-950/95 sm:backdrop-blur-md border border-amber-500/40 rounded-2xl shadow-2xl shadow-black/95 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left Action Group: Mithai (sm+), Soundboard, Chat */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenSweetsBox();
            }}
            className="hidden sm:flex min-h-[44px] min-w-[44px] px-2.5 lg:px-3 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/50 rounded-xl text-amber-300 text-xs font-semibold transition-all items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer"
            title="Open Sweets Box & Share with Friends"
          >
            <Gift className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden lg:inline">Mithai</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpandedDrawer(false);
              onToggleSoundboard();
            }}
            aria-expanded={isSoundboardOpen}
            aria-label="Toggle cracker soundboard"
            className={`min-h-[44px] min-w-[44px] px-2 sm:px-2.5 lg:px-3 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer ${
              isSoundboardOpen
                ? 'bg-amber-500/30 border-amber-300 text-amber-200 ring-2 ring-amber-400/50'
                : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700/80 text-zinc-200 hover:border-amber-400/60'
            }`}
            title="Cracker Soundboard (Trigger synced sound effects)"
          >
            <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden md:inline">Sounds</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleChat();
            }}
            aria-expanded={isChatOpen}
            aria-label="Toggle room chat"
            className={`relative min-h-[44px] min-w-[44px] px-2 sm:px-2.5 lg:px-3 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer ${
              isChatOpen
                ? 'bg-amber-500/30 border-amber-300 text-amber-200 ring-2 ring-amber-400/50'
                : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700/80 text-zinc-200 hover:border-amber-400/60'
            }`}
            title="Room Chat & Festive Greetings"
          >
            <MessageCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden md:inline">Chat</span>
            {unreadChatCount > 0 && !isChatOpen && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-amber-400 text-black rounded-full flex items-center justify-center tabular-nums shadow">
                {unreadChatCount > 99 ? '99+' : unreadChatCount}
              </span>
            )}
          </button>
        </div>

        {/* Expandable Grid Toggle on small screens */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isSoundboardOpen) onToggleSoundboard();
            setIsExpandedDrawer((v) => !v);
          }}
          aria-expanded={isExpandedDrawer}
          aria-label="Toggle full cracker tray"
          className="sm:hidden min-h-[44px] min-w-[44px] px-2 rounded-xl bg-zinc-900 border border-zinc-700 text-amber-300 flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
        >
          {isExpandedDrawer ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {/* Center: Touch-Friendly Horizontal Scrollable Cracker Shelf */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5 px-0.5 flex-1 min-w-0 justify-start scrollbar-none touch-pan-x">
          {crackerList.map((cracker) => {
            const isSelected = selectedCracker === cracker.type;

            return (
              <button
                type="button"
                key={cracker.type}
                draggable
                onDragStart={(e) => handleDragStart(e, cracker.type)}
                onClick={(e) => handleCardSelect(e, cracker.type)}
                aria-pressed={isSelected}
                className={`relative group min-h-[44px] flex items-center gap-2 px-2.5 sm:px-3 py-1.5 min-w-[96px] sm:min-w-[122px] rounded-xl cursor-pointer select-none transition-all duration-150 shrink-0 text-left active:scale-95 ${
                  isSelected
                    ? 'bg-amber-500/35 border-2 border-amber-300 ring-2 ring-amber-400/70 shadow-[0_0_16px_rgba(245,158,11,0.55)]'
                    : 'bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-amber-400/80'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-amber-950 border border-amber-300'
                      : 'bg-zinc-950/90 border border-zinc-800'
                  }`}
                >
                  {isSelected ? (
                    <Check className="w-4 h-4 text-amber-300 stroke-[3]" />
                  ) : (
                    getCrackerIcon(cracker.type, false)
                  )}
                </div>

                <div className="flex flex-col text-left whitespace-nowrap leading-tight pr-0.5">
                  <span className={`text-[11px] sm:text-xs font-semibold ${isSelected ? 'text-amber-100 font-bold' : 'text-zinc-100'}`}>
                    {cracker.name}
                  </span>
                  <span className={`text-[9px] sm:text-[10px] ${isSelected ? 'text-amber-200' : 'text-zinc-400'}`}>
                    {isSelected ? 'Tap again: burst' : `${cracker.hindiName} · ${cracker.durationSeconds}s`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Action Group: Share Joy & Grand Dhamaka (>= 44px touch hitboxes) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            type="button"
            disabled={shareJoyCooldown}
            onClick={(e) => {
              e.stopPropagation();
              onShareJoy();
            }}
            className="min-h-[44px] px-2 sm:px-3 py-2 bg-gradient-to-r from-fuchsia-600 via-pink-500 to-amber-400 hover:from-fuchsia-500 hover:to-yellow-300 disabled:opacity-65 text-white text-xs font-bold rounded-xl shadow-lg shadow-pink-500/25 transition-all active:scale-95 shrink-0 whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer"
            title="Share Joy: Screen-wide confetti explosion for everyone in the room"
          >
            <PartyPopper className="w-4 h-4 text-yellow-100 shrink-0" />
            <span className="hidden sm:inline">Share Joy</span>
            <span className="sm:hidden text-[11px]">Joy</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTriggerGrandFinale();
            }}
            className="min-h-[44px] px-2.5 sm:px-4 py-2 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/25 transition-all active:scale-95 shrink-0 whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer"
            title="Ignite Grand Finale Fireworks Display"
          >
            <Sparkles className="w-4 h-4 fill-white shrink-0" />
            <span className="hidden sm:inline">Grand Dhamaka</span>
            <span className="sm:hidden text-[11px]">Dhamaka</span>
          </button>
        </div>
      </div>
    </div>
  );
};
