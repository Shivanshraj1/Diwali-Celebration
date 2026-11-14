import React, { useState } from 'react';
import { CelebrationActivity, CelebrationRoom } from '../types';
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
  PartyPopper
} from 'lucide-react';

interface GlobalCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: CelebrationRoom;
  onlineCount: number;
  activities: CelebrationActivity[];
  userName: string;
  onSendWish: (wishText: string) => Promise<void>;
  onLightDiya: () => Promise<void>;
}

export const GlobalCelebrationModal: React.FC<GlobalCelebrationModalProps> = ({
  isOpen,
  onClose,
  room,
  onlineCount,
  activities,
  userName,
  onSendWish,
  onLightDiya
}) => {
  const [customWish, setCustomWish] = useState('');
  const [sending, setSending] = useState(false);
  const [hasSentWish, setHasSentWish] = useState(false);

  if (!isOpen) return null;

  const totalActions =
    room.crackersIgnited + room.sweetsShared + room.wishesSent + room.diyasLit;

  const quickWishes = [
    '॥ शुभ दीपावली ॥',
    'May light and joy brighten every home!',
    'Happy Diwali to everyone here!',
    'Spreading warmth, peace & festive joy!'
  ];

  const handleWishSubmit = async (wishText: string) => {
    const textToSend = wishText.trim() || customWish.trim();
    if (!textToSend || sending) return;

    setSending(true);
    try {
      soundEngine.playSweetCheer();
      await onSendWish(textToSend);
      setHasSentWish(true);
      setCustomWish('');
      setTimeout(() => setHasSentWish(false), 3000);
    } finally {
      setSending(false);
    }
  };

  const handleDiyaClick = async () => {
    if (sending) return;
    setSending(true);
    try {
      soundEngine.playSweetCheer();
      await onLightDiya();
      setHasSentWish(true);
      setTimeout(() => setHasSentWish(false), 2500);
    } finally {
      setSending(false);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
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
      case 'interact':
        return <Heart className="w-3.5 h-3.5 text-red-400" />;
      case 'diya':
        return <Flame className="w-3.5 h-3.5 text-yellow-400" />;
      case 'joy':
        return <PartyPopper className="w-3.5 h-3.5 text-pink-400" />;
      case 'join':
      case 'leave':
        return <Users className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 p-0.5 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white font-festive truncate">
                  {room.title}
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold rounded-full shrink-0">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                Real-time celebration activity &amp; live room metrics
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close activity feed"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-900 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Live Room Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-rose-500/15 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <div className="text-[11px] font-semibold text-amber-300 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Celebrating Live Now</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-display mt-0.5">
                {onlineCount} {onlineCount === 1 ? 'Friend' : 'Friends'} Online
              </div>
              <p className="text-xs text-zinc-300 mt-1">
                Host: <span className="text-amber-300 font-semibold">{room.hostName}</span> · Code: <span className="font-mono text-amber-200">{room.inviteCode}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleDiyaClick()}
              disabled={sending}
              className="min-h-[44px] w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-black text-xs font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-amber-600 text-amber-600" />
              <span>Light a Diya ({room.diyasLit})</span>
            </button>
          </div>

          {/* 4 Live Room Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase font-semibold">Total Lights</span>
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-amber-300 font-display">
                {totalActions}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase font-semibold">Crackers</span>
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-yellow-300 font-display">
                {room.crackersIgnited}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase font-semibold">Mithai</span>
                <Gift className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-rose-300 font-display">
                {room.sweetsShared}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] uppercase font-semibold">Wishes</span>
                <Heart className="w-3.5 h-3.5 text-red-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-red-300 font-display">
                {room.wishesSent}
              </div>
            </div>
          </div>

          {/* Send Live Blessing */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                <span>Send a Live Room Blessing as {userName}</span>
              </div>
              {hasSentWish && (
                <span className="text-xs text-emerald-400 font-semibold">✓ Sent!</span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {quickWishes.map((w, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => void handleWishSubmit(w)}
                  className="min-h-[36px] px-2.5 py-1 text-[11px] bg-zinc-950 hover:bg-amber-500/15 border border-zinc-800 hover:border-amber-400/60 text-zinc-300 hover:text-amber-200 rounded-lg transition-colors cursor-pointer"
                >
                  {w}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                maxLength={200}
                value={customWish}
                onChange={(e) => setCustomWish(e.target.value)}
                placeholder="Write a Diwali wish for your friends..."
                className="flex-1 min-h-[42px] px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleWishSubmit(customWish);
                }}
              />
              <button
                type="button"
                onClick={() => void handleWishSubmit(customWish)}
                disabled={!customWish.trim() || sending}
                className="min-h-[42px] px-4 py-1.5 bg-amber-400 disabled:opacity-40 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>

          {/* Live Room Event Feed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Room Timeline</span>
              </div>
              <span className="text-[10px] text-zinc-400">Real-time sync</span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-400 bg-zinc-900/40 rounded-xl">
                  Light a firework, share mithai, or send a blessing to start the timeline!
                </div>
              ) : (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                        {getActivityIcon(act.type)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-zinc-200 truncate">{act.text}</span>
                        {act.sender && (
                          <span className="text-[10px] text-amber-400/80 truncate">{act.sender}</span>
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
