import React, { useState, useEffect } from 'react';
import { CharacterData, CelebrationRoom, UserProfile } from '../types';
import {
  X,
  Check,
  Users,
  Link2,
  Share2,
  Copy,
  Sparkles,
  Gift,
  Palette,
  LogIn,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { AvatarImage } from './AvatarImage';
import { ACCESSORY_OPTIONS, DRESS_STYLE_OPTIONS } from '../data/constants';
import {
  WardrobeCustomizer,
  WardrobeFormState,
  profileToWardrobeState
} from './WardrobeCustomizer';

interface ManageCharactersModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: CharacterData[];
  currentUserUid: string;
  userProfile: UserProfile;
  googlePhotoUrl?: string | null;
  room: CelebrationRoom;
  initialSubTab?: 'people' | 'invite' | 'customize';
  onSaveMyLook: (updatedProfile: UserProfile) => Promise<void>;
  onInteractWithFriend: (friend: CharacterData, action: 'wave' | 'sweet') => void;
  onJoinByInviteCode: (inviteCode: string) => Promise<string | null>;
}

export const ManageCharactersModal: React.FC<ManageCharactersModalProps> = ({
  isOpen,
  onClose,
  participants,
  currentUserUid,
  userProfile,
  googlePhotoUrl,
  room,
  initialSubTab = 'people',
  onSaveMyLook,
  onInteractWithFriend,
  onJoinByInviteCode
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'people' | 'customize' | 'invite'>(initialSubTab);

  const [wardrobe, setWardrobe] = useState<WardrobeFormState>(() =>
    profileToWardrobeState(userProfile)
  );
  const [savingLook, setSavingLook] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joiningRoom, setJoiningRoom] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveSubTab(initialSubTab);
      setWardrobe(profileToWardrobeState(userProfile));
      setJoinError(null);
      setSaveError(null);
      setSavedToast(false);
    }
  }, [isOpen, initialSubTab, userProfile]);

  if (!isOpen) return null;

  const getInviteUrl = () => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('room', room.roomId);
    url.searchParams.set('invite', room.inviteCode);
    url.searchParams.set('invitedBy', userProfile.displayName || room.hostName);
    return url.toString();
  };

  const inviteUrl = getInviteUrl();
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `🪔 ${userProfile.displayName} invited you to celebrate Diwali live! Join here to light fireworks and share sweets together: ${inviteUrl}`
  )}`;

  const handleCopyInviteLink = () => {
    navigator.clipboard
      .writeText(inviteUrl)
      .then(() => {
        setCopiedLink(true);
        window.setTimeout(() => setCopiedLink(false), 2600);
      })
      .catch(() => {
        setCopiedLink(true);
      });
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Join our Live Diwali Celebration!',
          text: `${userProfile.displayName} invited you to light fireworks & share sweets together live!`,
          url: inviteUrl
        })
        .catch(() => {});
    } else {
      handleCopyInviteLink();
    }
  };

  const handleSaveProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wardrobe.displayName.trim() || savingLook) return;
    setSavingLook(true);
    setSaveError(null);
    try {
      await onSaveMyLook({
        uid: currentUserUid,
        displayName: wardrobe.displayName.trim(),
        photoURL: wardrobe.photoURL,
        gender: wardrobe.gender,
        dressStyle: wardrobe.dressStyle,
        outfitColor: wardrobe.colorPreset.outfitColor,
        accentBg: wardrobe.colorPreset.accentBg,
        accessory: wardrobe.accessory
      });
      setSavedToast(true);
      window.setTimeout(() => setSavedToast(false), 2400);
    } catch {
      setSaveError('Could not save your outfit right now. Please check your connection and try again.');
    } finally {
      setSavingLook(false);
    }
  };

  const handleJoinCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let raw = joinCodeInput.trim();
    if (!raw) return;

    if (raw.includes('invite=')) {
      try {
        const parsed = new URL(raw);
        raw = parsed.searchParams.get('invite') || raw;
      } catch {
        // Fallback to raw code string
      }
    }

    setJoiningRoom(true);
    setJoinError(null);
    const err = await onJoinByInviteCode(raw);
    setJoiningRoom(false);
    if (err) {
      setJoinError(err);
    } else {
      setJoinCodeInput('');
      onClose();
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className={`relative w-full ${
          activeSubTab === 'customize' ? 'max-w-3xl' : 'max-w-xl'
        } bg-zinc-950 border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[93dvh] transition-all duration-200`}
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/70 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white font-festive truncate">
                {room.title}
              </h3>
              <p className="text-[11px] text-zinc-400 truncate">
                {participants.length} online now · Invite Code:{' '}
                <span className="text-amber-300 font-mono">{room.inviteCode}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-900 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-zinc-800 px-3 sm:px-5 pt-2 bg-zinc-950 shrink-0 overflow-x-auto scrollbar-none gap-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('people')}
            className={`min-h-[44px] pb-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'people'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Online ({participants.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('invite')}
            className={`min-h-[44px] pb-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'invite'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Invite Friends</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('customize')}
            className={`min-h-[44px] pb-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'customize'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Wardrobe &amp; Dress</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: Genuine Live Participants List */}
          {activeSubTab === 'people' && (
            <div className="space-y-2.5">
              {participants.map((p) => {
                const dressLabel =
                  DRESS_STYLE_OPTIONS.find((d) => d.id === p.dressStyle)?.label || 'Kurta';
                const accLabel =
                  p.accessory && p.accessory !== 'none'
                    ? ACCESSORY_OPTIONS.find((a) => a.id === p.accessory)?.label
                    : null;
                return (
                  <div
                    key={p.id}
                    className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <div className={`w-11 h-11 rounded-full overflow-hidden border-2 ${p.accentBg} bg-zinc-800`}>
                          <AvatarImage
                            src={p.avatarUrl}
                            name={p.name}
                            characterId={p.id}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-zinc-900" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-white truncate">
                            {p.name}
                          </span>
                          {p.isCurrentUser && (
                            <span className="text-[10px] font-bold text-amber-300">(You)</span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 truncate">
                          {p.isHost ? 'Room Host' : p.relation} · {dressLabel}
                          {accLabel ? ` · ${accLabel}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {p.isCurrentUser ? (
                        <button
                          type="button"
                          onClick={() => setActiveSubTab('customize')}
                          className="min-h-[42px] px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xs font-semibold cursor-pointer"
                        >
                          Change Outfit
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onInteractWithFriend(p, 'wave')}
                            className="min-h-[42px] px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            title="Send Happy Diwali greeting"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Wish</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onInteractWithFriend(p, 'sweet')}
                            className="min-h-[42px] px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            title="Share Mithai with friend"
                          >
                            <Gift className="w-3.5 h-3.5 text-amber-300" />
                            <span>Mithai</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setActiveSubTab('invite')}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl border border-dashed border-amber-500/50 hover:border-amber-400 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Invite More Friends to This Celebration</span>
              </button>
            </div>
          )}

          {/* TAB 2: Invite Friends & Join Friend's Room */}
          {activeSubTab === 'invite' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-300 font-festive">
                    <Share2 className="w-4 h-4" />
                    <span>Invite Link</span>
                  </div>
                  <span className="text-xs font-mono text-zinc-300">
                    Code: <strong className="text-amber-300">{room.inviteCode}</strong>
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Share this link or invite code. Friends sign in with Google, pick their festive outfit, and join this exact room live in real time.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    className="flex-1 min-h-[44px] px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-300 select-all font-mono truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Share on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="min-h-[44px] py-2 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span>Other Apps</span>
                  </button>
                </div>
              </div>

              {/* Join Another Celebration by Code or Link */}
              <form
                onSubmit={handleJoinCodeSubmit}
                className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2.5"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span>Join a Friend&apos;s Celebration Room</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    placeholder="Paste friend's invite code or invite link"
                    className="flex-1 min-h-[44px] px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={joiningRoom || !joinCodeInput.trim()}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-50 border border-amber-400/50 text-amber-200 text-xs font-bold shrink-0 cursor-pointer"
                  >
                    {joiningRoom ? 'Joining...' : 'Join Room'}
                  </button>
                </div>
                {joinError && <p className="text-xs text-rose-400">{joinError}</p>}
              </form>
            </div>
          )}

          {/* TAB 3: Interactive Wardrobe Studio */}
          {activeSubTab === 'customize' && (
            <form onSubmit={handleSaveProfileSubmit} className="space-y-4">
              <WardrobeCustomizer
                value={wardrobe}
                onChange={setWardrobe}
                googlePhotoUrl={googlePhotoUrl}
                uid={currentUserUid}
              />

              {saveError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="sticky bottom-0 pt-2 bg-zinc-950/95 border-t border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  type="submit"
                  disabled={savingLook}
                  className="w-full sm:w-auto sm:min-w-[240px] min-h-[46px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black text-xs sm:text-sm font-extrabold cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>
                    {savingLook
                      ? 'Saving Outfit...'
                      : savedToast
                      ? '✓ Saved & Synced Live!'
                      : 'Save & Update My Outfit'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
