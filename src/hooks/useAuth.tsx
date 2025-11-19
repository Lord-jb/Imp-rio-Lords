import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  User
} from 'firebase/auth';
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';

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

  // Criação/atualização automática do perfil
  const ensureUserProfile = async (u: User) => {
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

    return onSnapshot(ref, (docSnap) => {
      setProfile(docSnap.data() as UserProfile);
      setLoading(false);
    });
  };

  // Observa login/logout
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsub = onAuthStateChanged(auth, async (u) => {
      setSession(u);
      if (unsubProfile) unsubProfile();

      if (u) {
        setLoading(true);
        unsubProfile = await ensureUserProfile(u);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsub();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  // Login com Google
  const signInWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no Google Login');
    }
  };

  // Login com email + senha
  const signInWithEmailPassword = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar com e-mail');
    }
  };

  // Registrar nova conta por email
  const registerWithEmailPassword = async (email: string, password: string) => {
    setError(null);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      // cria perfil
      await ensureUserProfile(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar');
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setProfile(null);
  };

  return {
    session,
    profile,
    loading,
    error,
    signInWithGoogle,
    signInWithEmailPassword,
    registerWithEmailPassword,
    signOut
  };
};
