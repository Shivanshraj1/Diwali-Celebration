import React, { Component, useCallback, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CountdownDiwali } from './components/CountdownDiwali';
import { LoginScreen } from './components/LoginScreen';
import { CrackerArena } from './components/CrackerArena';
import { InviteWelcomeModal } from './components/InviteWelcomeModal';
import {
  ensurePersonalRoomAndInvite,
  joinRoomAsParticipant,
  leaveRoomPresence,
  updateOwnParticipant,
  validateInviteCode
} from './services/firestoreCelebration';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { CelebrationRoom, UserProfile } from './types';
import { soundEngine } from './audio/soundEngine';
import { AlertCircle, Flame, Loader2, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class AppErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let display = error?.message || 'An unexpected issue occurred.';
    try {
      const parsed = JSON.parse(display);
      if (parsed && typeof parsed.error === 'string') {
        display = `Permission or connection error: ${parsed.error}`;
      }
    } catch {
      // keep raw message
    }
    return { hasError: true, errorMessage: display };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] w-full bg-zinc-950 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-rose-500/40 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-rose-400" />
            </div>
            <h2 className="text-lg font-bold font-festive">Unable to Continue Celebration</h2>
            <p className="text-xs text-zinc-300 leading-relaxed">{this.state.errorMessage}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface InviteParams {
  roomId?: string;
  inviteCode?: string;
  invitedBy?: string;
}

function readInitialUrlParams(): InviteParams {
  try {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room') || undefined;
    const inviteCode = params.get('invite') || undefined;
    const invitedBy = params.get('invitedBy') || undefined;
    return { roomId, inviteCode, invitedBy };
  } catch {
    return {};
  }
}

const CelebrationRouter: React.FC = () => {
  const {
    user,
    profile,
    authReady,
    authLoading,
    authError,
    signInWithGoogle,
    signOutUser,
    saveUserProfile,
    clearAuthError
  } = useAuth();

  const [urlParams] = useState<InviteParams>(() => readInitialUrlParams());
  const [showGreeting, setShowGreeting] = useState<boolean>(
    () => !urlParams.inviteCode && !urlParams.roomId
  );
  const [isMuted, setIsMuted] = useState(false);

  const [activeRoom, setActiveRoom] = useState<CelebrationRoom | null>(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [pendingInviteRoom, setPendingInviteRoom] = useState<{
    room: CelebrationRoom;
    invitedBy: string;
  } | null>(null);
  const [resolvedInviteForSession, setResolvedInviteForSession] = useState(false);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundEngine.setMute(next);
      return next;
    });
  }, []);

  const syncRoomUrl = useCallback((roomId: string) => {
    try {
      const nextUrl = new URL(window.location.origin + window.location.pathname);
      nextUrl.searchParams.set('room', roomId);
      window.history.replaceState({}, document.title, nextUrl.toString());
    } catch {
      // Ignore history issues
    }
  }, []);

  const enterPersonalRoom = useCallback(
    async (currentProfile: UserProfile) => {
      setRoomLoading(true);
      setInviteError(null);
      try {
        const { room } = await ensurePersonalRoomAndInvite(currentProfile);
        await joinRoomAsParticipant(room.roomId, currentProfile, 'Host', false);
        setActiveRoom(room);
        syncRoomUrl(room.roomId);
      } finally {
        setRoomLoading(false);
      }
    },
    [syncRoomUrl]
  );

  // Resolve room & invite flow once authenticated user & profile are loaded
  useEffect(() => {
    if (!authReady || !user || !profile || resolvedInviteForSession || activeRoom) return;

    let cancelled = false;
    const resolveRoom = async () => {
      setRoomLoading(true);
      try {
        if (urlParams.inviteCode) {
          const res = await validateInviteCode(urlParams.inviteCode);
          if (cancelled) return;
          if (!res.valid) {
            setInviteError(res.reason);
            setResolvedInviteForSession(true);
            setRoomLoading(false);
            return;
          }

          if (res.room.hostUid === profile.uid) {
            // Host opened their own link
            await joinRoomAsParticipant(res.room.roomId, profile, 'Host', false);
            if (!cancelled) {
              setActiveRoom(res.room);
              syncRoomUrl(res.room.roomId);
              setResolvedInviteForSession(true);
            }
          } else {
            // Invited friend customizes DP & dress before appearing live in arena
            setPendingInviteRoom({
              room: res.room,
              invitedBy: urlParams.invitedBy || res.room.hostName
            });
            setResolvedInviteForSession(true);
          }
          return;
        }

        if (urlParams.roomId) {
          const roomSnap = await getDoc(doc(db, 'celebrations', urlParams.roomId));
          if (cancelled) return;
          if (roomSnap.exists()) {
            const d = roomSnap.data();
            const fetchedRoom: CelebrationRoom = {
              roomId: d.roomId,
              title: d.title,
              hostUid: d.hostUid,
              hostName: d.hostName,
              inviteCode: d.inviteCode,
              bgScene: d.bgScene || 'courtyard',
              weatherMode: d.weatherMode || 'starlit',
              crackersIgnited: Number(d.crackersIgnited || 0),
              sweetsShared: Number(d.sweetsShared || 0),
              wishesSent: Number(d.wishesSent || 0),
              diyasLit: Number(d.diyasLit || 0)
            };
            const relation = fetchedRoom.hostUid === profile.uid ? 'Host' : 'Friend';
            await joinRoomAsParticipant(fetchedRoom.roomId, profile, relation, false);
            if (!cancelled) {
              setActiveRoom(fetchedRoom);
              setResolvedInviteForSession(true);
            }
            return;
          }
        }

        // Default: enter user's own celebration room
        await enterPersonalRoom(profile);
        setResolvedInviteForSession(true);
      } catch (err) {
        console.error('Room resolution error:', err);
        if (!cancelled) {
          setInviteError('Could not connect to the celebration room. Please try again.');
          setResolvedInviteForSession(true);
        }
      } finally {
        if (!cancelled) setRoomLoading(false);
      }
    };

    void resolveRoom();
    return () => {
      cancelled = true;
    };
  }, [
    authReady,
    user,
    profile,
    resolvedInviteForSession,
    activeRoom,
    urlParams.inviteCode,
    urlParams.invitedBy,
    urlParams.roomId,
    enterPersonalRoom,
    syncRoomUrl
  ]);

  // Best-effort offline cleanup if browser tab closes
  useEffect(() => {
    if (!activeRoom || !profile) return;
    const handlePageHide = () => {
      void leaveRoomPresence(activeRoom.roomId, profile.uid, profile.displayName, true);
    };
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [activeRoom, profile]);

  const handleAcceptPendingInvite = async (customizedProfile: UserProfile, relation: string) => {
    if (!pendingInviteRoom) return;
    setRoomLoading(true);
    try {
      const saved = (await saveUserProfile(customizedProfile)) || customizedProfile;
      await joinRoomAsParticipant(pendingInviteRoom.room.roomId, saved, relation, true);
      soundEngine.startAtmosphere();
      soundEngine.playSweetCheer();
      setActiveRoom(pendingInviteRoom.room);
      syncRoomUrl(pendingInviteRoom.room.roomId);
      setPendingInviteRoom(null);
    } finally {
      setRoomLoading(false);
    }
  };

  const handleDismissInviteCustomization = async () => {
    if (!pendingInviteRoom || !profile) return;
    setRoomLoading(true);
    try {
      await joinRoomAsParticipant(
        pendingInviteRoom.room.roomId,
        profile,
        `Friend of ${pendingInviteRoom.invitedBy}`,
        true
      );
      soundEngine.startAtmosphere();
      soundEngine.playSweetCheer();
      setActiveRoom(pendingInviteRoom.room);
      syncRoomUrl(pendingInviteRoom.room.roomId);
      setPendingInviteRoom(null);
    } finally {
      setRoomLoading(false);
    }
  };

  const handleJoinByInviteCode = async (rawCode: string): Promise<string | null> => {
    if (!profile) return 'Please sign in first.';
    const res = await validateInviteCode(rawCode);
    if (!res.valid) {
      return res.reason;
    }

    if (activeRoom && activeRoom.roomId !== res.room.roomId) {
      await leaveRoomPresence(activeRoom.roomId, profile.uid, profile.displayName, true);
    }

    const relation = res.room.hostUid === profile.uid ? 'Host' : `Friend of ${res.room.hostName}`;
    await joinRoomAsParticipant(res.room.roomId, profile, relation, true);
    setActiveRoom(res.room);
    syncRoomUrl(res.room.roomId);
    return null;
  };

  const handleSaveProfileAndParticipant = async (updated: UserProfile) => {
    const saved = (await saveUserProfile(updated)) || updated;
    if (activeRoom) {
      await updateOwnParticipant(activeRoom.roomId, saved.uid, {
        name: saved.displayName,
        photoURL: saved.photoURL,
        gender: saved.gender,
        dressStyle: saved.dressStyle,
        outfitColor: saved.outfitColor,
        accentBg: saved.accentBg,
        accessory: saved.accessory || 'none'
      });
    }
  };

  const handleLogout = async () => {
    if (activeRoom && profile) {
      await leaveRoomPresence(activeRoom.roomId, profile.uid, profile.displayName, true);
    }
    setActiveRoom(null);
    setPendingInviteRoom(null);
    setResolvedInviteForSession(false);
    await signOutUser();
  };

  // 1. Checking existing persistent Firebase auth session
  if (!authReady) {
    return (
      <div className="min-h-[100dvh] w-full bg-zinc-950 flex flex-col items-center justify-center p-4 gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center">
          <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-200 font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Preparing your Diwali celebration...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated visitor: Greeting Countdown -> Google Sign-In Screen
  if (!user || !profile) {
    if (showGreeting) {
      return (
        <CountdownDiwali
          onEnterTerrace={() => {
            soundEngine.startAtmosphere();
            setShowGreeting(false);
          }}
        />
      );
    }
    return (
      <LoginScreen
        onGoogleSignIn={async () => {
          soundEngine.startAtmosphere();
          await signInWithGoogle();
        }}
        loading={authLoading}
        error={authError}
        onDismissError={clearAuthError}
        inviteHostHint={
          urlParams.inviteCode ? urlParams.invitedBy || 'a friend' : null
        }
      />
    );
  }

  // 3. Invalid / expired invitation screen with graceful recovery
  if (inviteError && !activeRoom) {
    return (
      <div className="min-h-[100dvh] w-full bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-white font-festive">Invitation Unavailable</h2>
          <p className="text-xs text-zinc-300 leading-relaxed">{inviteError}</p>
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={() => void enterPersonalRoom(profile)}
              className="w-full min-h-[46px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-black text-xs font-extrabold cursor-pointer"
            >
              Start Your Own Celebration Room
            </button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Invited friend customizing avatar DP & traditional dress before entering arena
  if (pendingInviteRoom) {
    return (
      <InviteWelcomeModal
        invitedBy={pendingInviteRoom.invitedBy}
        roomTitle={pendingInviteRoom.room.title}
        initialProfile={profile}
        googlePhotoUrl={user.photoURL}
        onJoin={handleAcceptPendingInvite}
        onDismiss={handleDismissInviteCustomization}
      />
    );
  }

  // 5. Connecting into Firestore celebration room
  if (roomLoading || !activeRoom) {
    return (
      <div className="min-h-[100dvh] w-full bg-zinc-950 flex flex-col items-center justify-center p-4 gap-3 text-center">
        <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
        <p className="text-xs text-amber-200 font-medium">
          Joining live celebration arena...
        </p>
      </div>
    );
  }

  // 6. Optional Greeting Replay overlay if requested from header
  if (showGreeting) {
    return (
      <CountdownDiwali
        onEnterTerrace={() => {
          soundEngine.startAtmosphere();
          setShowGreeting(false);
        }}
      />
    );
  }

  // 7. Live Multiplayer Diwali Celebration Arena
  return (
    <CrackerArena
      room={activeRoom}
      userProfile={profile}
      googlePhotoUrl={user.photoURL}
      isMuted={isMuted}
      onToggleMute={toggleMute}
      onReplayGreeting={() => setShowGreeting(true)}
      onSaveProfile={handleSaveProfileAndParticipant}
      onJoinRoomByCode={handleJoinByInviteCode}
      onLogout={handleLogout}
    />
  );
};

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <main className="w-full min-h-[100dvh] bg-black overflow-hidden font-sans">
          <CelebrationRouter />
        </main>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
