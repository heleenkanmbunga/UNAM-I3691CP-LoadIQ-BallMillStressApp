// firestoreService.js
// Handles all Firestore read, write, and delete operations
// Collections: calculations | Load IQ | UNAM I3691CP | Semester 1, 2026
import { db } from './firebaseConfig';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

export async function saveCalculation(userId, data) {
  await addDoc(collection(db, 'calculations'), {
    userId,
    ...data,
    timestamp: serverTimestamp(),
  });
}

export async function getCalculations(userId) {
  const q = query(
    collection(db, 'calculations'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteCalculation(calcId) {
  await deleteDoc(doc(db, 'calculations', calcId));
}
