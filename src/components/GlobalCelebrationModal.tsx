import React, { useState } from 'react';
import { GlobalCelebrationStats, CelebrationActivity } from '../types';
import { realtimeCelebration } from '../services/realtimeCelebration';
import { soundEngine } from '../audio/soundEngine';
import {
  X,
  Users,
  Flame,
  Sparkles,
  Gift,
  Heart,
  Send,
  Radio,
  Clock,
  TrendingUp,
  Share2
} from 'lucide-react';

interface GlobalCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GlobalCelebrationStats;
}

export const GlobalCelebrationModal: React.FC<GlobalCelebrationModalProps> = ({
  isOpen,
  onClose,
  stats
}) => {
  const [customWish, setCustomWish] = useState('');
  const [senderName, setSenderName] = useState('Celebrator');
  const [hasSentWish, setHasSentWish] = useState(false);

  if (!isOpen) return null;

  const quickWishes = [
    '॥ शुभ दीपावली ॥',
    'May prosperity and joy brighten your home!',
    'Happy Diwali from India to the world!',
    'Spreading love, light, and sweet moments!'
  ];

  const handleSendWish = (wishText: string) => {
    const textToSend = wishText.trim() || customWish.trim();
    if (!textToSend) return;

    soundEngine.playSweetCheer();
    realtimeCelebration.reportAction('wish', textToSend, senderName.trim() || 'Celebrator');

    setHasSentWish(true);
    setCustomWish('');
    setTimeout(() => setHasSentWish(false), 3000);
  };

  const handleLightDiya = () => {
    soundEngine.playSweetCheer();
    realtimeCelebration.reportAction('diya', 'Lit a sacred festive Diya for peace and prosperity!', senderName.trim() || 'Celebrator');
    setHasSentWish(true);
    setTimeout(() => setHasSentWish(false), 2500);
  };

  // Milestone calculation
  const targetMilestone = 50000;
  const progressPercent = Math.min(100, Math.round((stats.totalCelebrations / targetMilestone) * 100));

  const formatTimeAgo = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${Math.floor(diffMin / 60)}h ago`;
  };

  const getActivityIcon = (type: CelebrationActivity['type']) => {
    switch (type) {
      case 'cracker':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case 'sweet':
        return <Gift className="w-3.5 h-3.5 text-rose-400" />;
      case 'wish':
        return <Heart className="w-3.5 h-3.5 text-red-400" />;
      case 'diya':
        return <Flame className="w-3.5 h-3.5 text-yellow-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-festive">
                  Global Diwali Celebration
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Live community counter &amp; worldwide celebration feed
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Top Live Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-rose-500/15 border border-amber-500/40 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <div className="text-[11px] font-semibold text-amber-300 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Currently Celebrating Together</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 font-display mt-0.5">
                {stats.activeUsers.toLocaleString()} People Online
              </div>
              <p className="text-xs text-zinc-300 mt-1">
                Lighting fireworks, sharing traditional sweets, and spreading festive joy across the globe!
              </p>
            </div>

            <button
              onClick={handleLightDiya}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-black text-xs font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
            >
              <Flame className="w-4 h-4 fill-amber-600 text-amber-600 animate-bounce" />
              <span>Light a Community Diya</span>
            </button>
          </div>

          {/* 4 Community Stats Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase font-semibold">Total Actions</span>
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-amber-300 font-display">
                {stats.totalCelebrations.toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-400">Total festive lights</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase font-semibold">Crackers Burst</span>
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-yellow-300 font-display">
                {stats.crackersIgnited.toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-400">Anar, Charkhi, Rockets</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase font-semibold">Mithai Shared</span>
                <Gift className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-rose-300 font-display">
                {stats.sweetsShared.toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-400">Kaju Katli &amp; Ladoos</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase font-semibold">Wishes Sent</span>
                <Heart className="w-3.5 h-3.5 text-red-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-red-300 font-display">
                {stats.wishesSent.toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-400">Deepavali blessings</span>
            </div>
          </div>

          {/* Community Milestone Progress Bar */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200">
                Global Community Milestone: <span className="text-amber-400 font-bold">{targetMilestone.toLocaleString()} Celebrations</span>
              </span>
              <span className="font-mono text-amber-300 font-semibold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-rose-500 transition-all duration-700 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>{stats.totalCelebrations.toLocaleString()} contributed</span>
              <span>{(targetMilestone - stats.totalCelebrations > 0 ? targetMilestone - stats.totalCelebrations : 0).toLocaleString()} more to milestone!</span>
            </div>
          </div>

          {/* Send Instant Community Festive Blessing */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                <span>Send a Live Global Blessing</span>
              </div>
              {hasSentWish && (
                <span className="text-xs text-emerald-400 font-semibold animate-in fade-in">
                  ✓ Blessing sent worldwide!
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {quickWishes.map((w, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendWish(w)}
                  className="px-2.5 py-1 text-[11px] bg-zinc-950 hover:bg-amber-500/15 border border-zinc-800 hover:border-amber-400/60 text-zinc-300 hover:text-amber-200 rounded-lg transition-colors"
                >
                  {w}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your Name..."
                className="w-28 sm:w-36 px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
              <input
                type="text"
                value={customWish}
                onChange={(e) => setCustomWish(e.target.value)}
                placeholder="Type your festive message to the world..."
                className="flex-1 px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendWish(customWish);
                }}
              />
              <button
                onClick={() => handleSendWish(customWish)}
                disabled={!customWish.trim()}
                className="px-4 py-1.5 bg-amber-400 disabled:opacity-40 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-colors shadow-md shrink-0 flex items-center gap-1"
              >
                <span>Send</span>
              </button>
            </div>
          </div>

          {/* Live Realtime Community Activity Feed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Community Celebration Feed</span>
              </div>
              <span className="text-[10px] text-zinc-400">Updates live across devices</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {stats.recentActivities.length === 0 ? (
                <div className="p-3 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-xl">
                  Listening for community celebration actions...
                </div>
              ) : (
                stats.recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors gap-3 animate-in fade-in"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                        {getActivityIcon(act.type)}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-xs text-zinc-200 truncate">
                          {act.text}
                        </span>
                        {act.sender && (
                          <span className="text-[10px] text-amber-400/80 truncate">
                            By {act.sender}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 whitespace-nowrap shrink-0">
                      {formatTimeAgo(act.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
