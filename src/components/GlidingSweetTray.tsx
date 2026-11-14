import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { SweetType } from '../types';
import { SWEET_DEFINITIONS } from '../data/constants';

interface GlidingSweetTrayProps {
  id: string;
  sweetType: SweetType;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  senderName: string;
  targetName?: string;
  onComplete: (id: string) => void;
}

export const GlidingSweetTray: React.FC<GlidingSweetTrayProps> = ({
  id,
  sweetType,
  startX,
  startY,
  targetX,
  targetY,
  senderName,
  targetName,
  onComplete
}) => {
  const def = SWEET_DEFINITIONS[sweetType] || SWEET_DEFINITIONS['kaju_katli'];

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(id);
    }, 1800);
    return () => clearTimeout(timer);
  }, [id, onComplete]);

  return (
    <motion.div
      initial={{ x: startX, y: startY, scale: 0.6, opacity: 0 }}
      animate={{
        x: [startX, (startX + targetX) / 2, targetX],
        y: [startY, Math.min(startY, targetY) - 60, targetY],
        scale: [0.7, 1.2, 0.85],
        opacity: [0, 1, 1, 0.95, 0]
      }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      className="absolute z-50 pointer-events-none flex flex-col items-center select-none"
    >
      <div className="relative px-3.5 py-1.5 rounded-2xl bg-zinc-950/95 border border-amber-400/90 shadow-[0_0_30px_rgba(245,158,11,0.7)] flex items-center gap-2 backdrop-blur-xl">
        <span className="text-xl animate-bounce">{def.symbol || '🍬'}</span>
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[11px] font-bold text-amber-200">{def.name} Tray</span>
          <span className="text-[9px] text-zinc-300">
            {senderName} ➔ {targetName || 'Everyone'}
          </span>
        </div>
      </div>
      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shadow-[0_0_15px_#F59E0B]" />
    </motion.div>
  );
};
