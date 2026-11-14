import React from 'react';
import { CelebrationActivity, CelebrationRoom } from '../types';
import { Sparkles } from 'lucide-react';

interface GlobalCelebrationBadgeProps {
  onlineCount: number;
  room: CelebrationRoom;
  latestActivity?: CelebrationActivity;
  onClick: () => void;
}

export const GlobalCelebrationBadge: React.FC<GlobalCelebrationBadgeProps> = ({
  onlineCount,
  room,
  latestActivity,
  onClick
}) => {
  const totalActions =
    room.crackersIgnited + room.sweetsShared + room.wishesSent + room.diyasLit;

  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[40px] sm:min-h-[44px] group relative flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500/15 via-zinc-900/90 to-yellow-500/15 hover:from-amber-500/25 hover:to-yellow-500/25 border border-amber-500/40 hover:border-amber-400/80 rounded-xl transition-all shadow-md active:scale-95 text-left cursor-pointer"
      title="View Live Room Activity, Diyas & Blessings"
    >
      <div className="relative flex items-center justify-center shrink-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="absolute w-3.5 h-3.5 rounded-full bg-emerald-400/50 animate-ping" />
      </div>

      <div className="flex flex-col leading-tight min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-amber-300 group-hover:text-amber-200 whitespace-nowrap">
            {onlineCount} Online
          </span>
          <span className="hidden lg:inline text-[10px] text-zinc-500">·</span>
          <span className="hidden lg:inline text-[10px] text-zinc-300 font-medium whitespace-nowrap">
            {totalActions} Actions
          </span>
        </div>

        <span className="hidden sm:block text-[9px] text-zinc-400 truncate max-w-[140px] md:max-w-[190px]">
          {latestActivity ? latestActivity.text : 'Live room feed'}
        </span>
      </div>

      <Sparkles className="w-3.5 h-3.5 text-amber-400/80 shrink-0 hidden sm:block" />
    </button>
  );
};
