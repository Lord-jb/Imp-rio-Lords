// FILE: src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const u = result.user;
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
        }
      } finally {
        navigate('/');
      }
    };
    run();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400">Finalizando login...</p>
      </div>
    </div>
  );
};