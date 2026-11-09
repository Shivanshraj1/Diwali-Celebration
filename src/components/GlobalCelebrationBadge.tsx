import React from 'react';
import { GlobalCelebrationStats, CelebrationActivity } from '../types';
import { Users, Radio, Sparkles } from 'lucide-react';

interface GlobalCelebrationBadgeProps {
  stats: GlobalCelebrationStats;
  latestActivity?: CelebrationActivity;
  onClick: () => void;
}

export const GlobalCelebrationBadge: React.FC<GlobalCelebrationBadgeProps> = ({
  stats,
  latestActivity,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/15 via-zinc-900/90 to-yellow-500/15 hover:from-amber-500/25 hover:to-yellow-500/25 border border-amber-500/40 hover:border-amber-400/80 rounded-xl transition-all shadow-md hover:shadow-amber-500/10 active:scale-95 text-left"
      title="View Real-Time Global Celebration Count & Live Activity"
    >
      {/* Live Pulsing Beacon */}
      <div className="relative flex items-center justify-center shrink-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="absolute w-3.5 h-3.5 rounded-full bg-emerald-400/50 animate-ping" />
      </div>

      {/* Main Metric Text */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-amber-300 group-hover:text-amber-200 transition-colors whitespace-nowrap">
            {stats.activeUsers.toLocaleString()} Celebrating Live
          </span>
          <span className="hidden lg:inline text-[10px] text-zinc-500">·</span>
          <span className="hidden lg:inline text-[10px] text-zinc-300 font-medium">
            {stats.totalCelebrations.toLocaleString()} Lights
          </span>
        </div>

        {/* Dynamic community subtitle or latest event ticker */}
        <span className="text-[9px] text-zinc-400 group-hover:text-amber-300/80 transition-colors truncate max-w-[140px] sm:max-w-[200px]">
          {latestActivity ? (
            <span className="text-amber-200 font-medium animate-in fade-in">
              {latestActivity.text}
            </span>
          ) : (
            'Tap for Global Live Stats & Feed'
          )}
        </span>
      </div>

      <Sparkles className="w-3 h-3 text-amber-400/70 group-hover:text-amber-300 group-hover:rotate-12 transition-transform shrink-0" />
    </button>
  );
};
