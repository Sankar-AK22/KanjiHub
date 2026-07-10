import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD-RrZVS13CVuKGrMEQgLUQEgiyGozFmx4",
  authDomain: "kanjihub-2d780.firebaseapp.com",
  projectId: "kanjihub-2d780",
  storageBucket: "kanjihub-2d780.firebasestorage.app",
  messagingSenderId: "323659556540",
  appId: "1:323659556540:web:51d80dbce1ee904ec452b9",
  measurementId: "G-6KS4SJBNYZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
