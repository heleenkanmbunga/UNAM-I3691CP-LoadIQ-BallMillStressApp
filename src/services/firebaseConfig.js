import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCAa4Qd84soxRhibaIFY1xSLboMh5Aq9FM",
  authDomain: "loadiq-e9c0f.firebaseapp.com",
  projectId: "loadiq-e9c0f",
  storageBucket: "loadiq-e9c0f.firebasestorage.app",
  messagingSenderId: "542327089612",
  appId: "1:542327089612:web:049a64bd382b455c7b5569"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);