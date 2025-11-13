// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as fbSignOut, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';

export type UserRole = 'admin' | 'client';

export interface UserProfile {
  id: string;
  role: UserRole;
  active: boolean;
  email: string;
  name: string;
  avatar: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export const useAuth = () => {
  const [session, setSession] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setSession(u);
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }
      if (u?.uid) {
        const ref = doc(db, 'users', u.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            id: u.uid,
            email: u.email || '',
            name: u.displayName || '',
            avatar: u.photoURL || '',
            role: 'client',
            active: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else {
          await setDoc(ref, { updatedAt: serverTimestamp() }, { merge: true });
        }
        unsubProfile = onSnapshot(ref, (docSnap) => {
          const data = docSnap.data() as UserProfile | undefined;
          setProfile(data || null);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => {
      if (unsubProfile) unsubProfile();
      unsubAuth();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await fbSignOut(auth);
      setProfile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed');
    }
  };

  return { session, profile, loading, error, signInWithGoogle, signOut };
};
