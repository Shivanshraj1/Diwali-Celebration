import React from 'react';
import { motion } from 'motion/react';
import { Flame, Sparkles, Users, Gift, AlertCircle, Loader2 } from 'lucide-react';
import { COURTYARD_BACKDROP } from '../data/constants';
import { PROCEDURAL_COURTYARD_SVG } from '../assets/proceduralBackgrounds';

interface LoginScreenProps {
  onGoogleSignIn: () => Promise<void>;
  loading: boolean;
  error: string | null;
  onDismissError: () => void;
  inviteHostHint?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onGoogleSignIn,
  loading,
  error,
  onDismissError,
  inviteHostHint
}) => {
  const [imgFailed, setImgFailed] = React.useState(false);

  return (
    <div className="relative min-h-[100dvh] w-full bg-zinc-950 overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center px-4 py-8 sm:py-12 select-none">
      {/* Starlit Courtyard Backdrop */}
      <img
        src={imgFailed ? PROCEDURAL_COURTYARD_SVG : COURTYARD_BACKDROP}
        onError={() => setImgFailed(true)}
        alt="Starlit Diwali Courtyard"
        className="fixed inset-0 w-full h-full object-cover object-center opacity-35 pointer-events-none"
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/75 via-zinc-950/70 to-black/95 pointer-events-none" />

      {/* Warm Ambient Festive Embers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 18 }).map((_, idx) => (
          <motion.span
            key={idx}
            className="absolute w-1.5 h-1.5 rounded-full bg-amber-400/70"
            style={{
              left: `${(idx * 17 + 7) % 94}%`,
              top: `${(idx * 23 + 12) % 88}%`
            }}
            animate={{
              y: [0, -28, 0],
              opacity: [0.25, 0.85, 0.25],
              scale: [0.9, 1.3, 0.9]
            }}
            transition={{
              duration: 3.2 + (idx % 4) * 0.7,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: (idx % 5) * 0.4
            }}
          />
        ))}
      </div>

      {/* Main Welcome & Google Auth Card */}
      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md bg-zinc-950/90 backdrop-blur-xl border border-amber-500/40 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden"
      >
        {/* Top Glowing Diya Header */}
        <div className="px-6 pt-7 pb-5 text-center border-b border-zinc-800/80 bg-gradient-to-b from-amber-500/15 via-amber-900/10 to-transparent">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-rose-500 p-0.5 shadow-[0_0_32px_rgba(245,158,11,0.55)] mb-4">
            <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center">
              <Flame className="w-7 h-7 text-amber-400 fill-amber-400 animate-pulse" />
            </div>
          </div>

          <p className="text-sm sm:text-base font-serif text-amber-300/95 tracking-widest font-festive">
            ॥ शुभ दीपावली ॥
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
            Diwali Celebration
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xs mx-auto">
            Light fireworks, dress up in festive Indian attire, and celebrate together live with friends and family.
          </p>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Invite Banner when arriving from a friend's invite link */}
          {inviteHostHint && (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/50 text-left flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-amber-200">
                  Invitation from {inviteHostHint}
                </p>
                <p className="text-[11px] text-amber-100/80 mt-0.5 leading-snug">
                  Sign in with Google below to join their live celebration room instantly.
                </p>
              </div>
            </div>
          )}

          {/* Friendly Error Alert */}
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/50 flex items-start gap-2.5 text-left"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-rose-200 leading-relaxed">{error}</p>
              </div>
              <button
                type="button"
                onClick={onDismissError}
                className="text-xs text-rose-300 hover:text-white font-semibold px-1.5 py-0.5 shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Highlighted Features (Clean typographic rows, no pill clutter) */}
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-100">Celebrate Together in Real Time</p>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Share an invite link so friends appear live in your courtyard with their photo and outfit.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-100">Touch-Friendly Fireworks</p>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Ignite Charkhi, Anar, Rockets, Skyshots &amp; Sky Calligraphy effortlessly on phone or desktop.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-100">Festive Wardrobe &amp; Mithai</p>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Customize Kurta-Pajama, Sherwani, Indo-Western, Saree, Lehenga, or Anarkali with accessories &amp; share sweets live.
                </p>
              </div>
            </div>
          </div>

          {/* Primary Google Sign-In CTA (Accessible 48px touch target) */}
          <button
            type="button"
            onClick={() => void onGoogleSignIn()}
            disabled={loading}
            className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-white hover:bg-zinc-100 active:scale-[0.99] disabled:opacity-65 disabled:cursor-not-allowed text-zinc-900 font-bold text-sm shadow-xl shadow-black/40 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                <span>Connecting your Google account...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-8.97z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.37 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-zinc-400 leading-relaxed">
            Your Google name and profile photo are used for your celebration avatar. You stay signed in across visits and can log out anytime.
          </p>
        </div>
      </motion.section>
    </div>
  );
};
