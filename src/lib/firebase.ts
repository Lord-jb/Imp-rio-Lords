import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB_qmaiWkAfq78L90TltBnKHAgqlNPVMF0",
  authDomain: "area-de-clientes-imp.firebaseapp.com",
  projectId: "area-de-clientes-imp",
  storageBucket: "area-de-clientes-imp.firebasestorage.app",
  messagingSenderId: "264562445886",
  appId: "1:264562445886:web:8da7ca04aa25c6c5c6cb6f",
  measurementId: "G-4E8XD6W4MZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);