import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  OperationType,
  handleFirestoreError
} from '../firebase';
import { CharacterAccessory, DressStyle, UserProfile } from '../types';
import {
  AVATAR_PRESETS,
  OUTFIT_COLOR_PRESETS,
  inferGenderFromName
} from '../data/constants';
import { PRIYA_SVG_DATA_URI, AARAV_SVG_DATA_URI } from '../assets/demoFaces';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  authReady: boolean;
  authLoading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
  saveUserProfile: (updates: Partial<Omit<UserProfile, 'uid'>>) => Promise<UserProfile | null>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function sanitizeDisplayName(name: string | null | undefined): string {
  const cleaned = (name || 'Celebrator').trim().slice(0, 56);
  return cleaned || 'Celebrator';
}

function sanitizePhotoUrl(url: string | null | undefined, gender: 'female' | 'male'): string {
  if (url && url.trim().length > 0 && url.length <= 190000) {
    return url.trim();
  }
  const preset = AVATAR_PRESETS.find((p) => p.gender === gender);
  return preset?.url || (gender === 'female' ? PRIYA_SVG_DATA_URI : AARAV_SVG_DATA_URI);
}

function mapFirebaseAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  const message = (err as { message?: string })?.message || '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Google sign-in window was closed before completing. Please tap "Continue with Google" again.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Your browser blocked the sign-in popup. Please allow popups for this site and try again.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection seems unstable. Please check your internet and try signing in again.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'This domain is not yet authorized in Firebase Authentication settings.';
  }
  if (message) {
    return `Unable to sign in right now (${code || 'auth error'}). Please try again.`;
  }
  return 'Something went wrong during Google Sign-In. Please try again.';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const syncAccountDocs = useCallback(async (firebaseUser: User): Promise<UserProfile> => {
    const uid = firebaseUser.uid;
    const displayName = sanitizeDisplayName(firebaseUser.displayName);
    const inferredGender = inferGenderFromName(displayName) || 'female';
    const defaultDress: DressStyle = inferredGender === 'female' ? 'saree' : 'kurta';
    const defaultColor = inferredGender === 'female' ? OUTFIT_COLOR_PRESETS[0] : OUTFIT_COLOR_PRESETS[1];
    const safePhoto = sanitizePhotoUrl(firebaseUser.photoURL, inferredGender);

    // 1. Sync strictly owner-private account PII record
    const privatePath = `users/${uid}/private/account`;
    const privateRef = doc(db, 'users', uid, 'private', 'account');
    try {
      const privSnap = await getDoc(privateRef);
      const email = (firebaseUser.email || `${uid}@users.local`).slice(0, 250);
      if (!privSnap.exists()) {
        await setDoc(privateRef, {
          uid,
          email,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        });
      } else {
        await updateDoc(privateRef, {
          email,
          lastLoginAt: serverTimestamp()
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, privatePath);
    }

    // 2. Load or create user's celebration profile
    const profilePath = `users/${uid}`;
    const profileRef = doc(db, 'users', uid);
    try {
      const profSnap = await getDoc(profileRef);
      if (profSnap.exists()) {
        const existing = profSnap.data() as Partial<UserProfile>;
        const resolved: UserProfile = {
          uid,
          displayName: sanitizeDisplayName(existing.displayName || displayName),
          photoURL: sanitizePhotoUrl(existing.photoURL || safePhoto, existing.gender || inferredGender),
          gender: existing.gender === 'male' || existing.gender === 'female' ? existing.gender : inferredGender,
          dressStyle: existing.dressStyle || defaultDress,
          outfitColor: existing.outfitColor || defaultColor.outfitColor,
          accentBg: existing.accentBg || defaultColor.accentBg,
          accessory: (existing.accessory as CharacterAccessory | undefined) || 'none'
        };
        return resolved;
      } else {
        const freshProfile: UserProfile = {
          uid,
          displayName,
          photoURL: safePhoto,
          gender: inferredGender,
          dressStyle: defaultDress,
          outfitColor: defaultColor.outfitColor,
          accentBg: defaultColor.accentBg,
          accessory: inferredGender === 'female' ? 'dupatta' : 'none'
        };
        await setDoc(profileRef, {
          ...freshProfile,
          updatedAt: serverTimestamp()
        });
        return freshProfile;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, profilePath);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setAuthReady(true);
        return;
      }

      try {
        const loadedProfile = await syncAccountDocs(firebaseUser);
        setProfile(loadedProfile);
      } catch (err) {
        console.error('Failed syncing user profile:', err);
        setAuthError('Could not load your celebration profile from Firestore. Please retry.');
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, [syncAccountDocs]);

  const signInWithGoogle = useCallback(async (): Promise<User | null> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loaded = await syncAccountDocs(result.user);
      setProfile(loaded);
      return result.user;
    } catch (err) {
      setAuthError(mapFirebaseAuthError(err));
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, [syncAccountDocs]);

  const signOutUser = useCallback(async () => {
    setAuthLoading(true);
    try {
      await signOut(auth);
      setProfile(null);
      setUser(null);
    } catch {
      setAuthError('Could not log out cleanly. Please refresh the page.');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const saveUserProfile = useCallback(
    async (updates: Partial<Omit<UserProfile, 'uid'>>): Promise<UserProfile | null> => {
      if (!user || !profile) return null;
      const merged: UserProfile = {
        uid: user.uid,
        displayName: sanitizeDisplayName(updates.displayName ?? profile.displayName),
        photoURL: sanitizePhotoUrl(updates.photoURL ?? profile.photoURL, updates.gender ?? profile.gender),
        gender: updates.gender ?? profile.gender,
        dressStyle: updates.dressStyle ?? profile.dressStyle,
        outfitColor: updates.outfitColor ?? profile.outfitColor,
        accentBg: updates.accentBg ?? profile.accentBg,
        accessory: updates.accessory ?? profile.accessory ?? 'none'
      };

      const profilePath = `users/${user.uid}`;
      try {
        await setDoc(doc(db, 'users', user.uid), {
          ...merged,
          updatedAt: serverTimestamp()
        });
        setProfile(merged);
        return merged;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, profilePath);
      }
    },
    [user, profile]
  );

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        authReady,
        authLoading,
        authError,
        signInWithGoogle,
        signOutUser,
        saveUserProfile,
        clearAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
