import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAzpV3FnPvOXrukgPZHo8JObUNeI_Ex2p8",
  authDomain: "lifelink-ih11.firebaseapp.com",
  projectId: "lifelink-ih11",
  storageBucket: "lifelink-ih11.firebasestorage.app",
  messagingSenderId: "589553796637",
  appId: "1:589553796637:web:bde1d61f67fe60bbf3e8f4",
  measurementId: "G-YGPEVZ7JJP"
};

// Initialize Firebase
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {
  // Ignore persistence error if browser storage is restricted
});

// Initialize Cloud Firestore
export const db = getFirestore(app);

