import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD7b5Fuc0LdXZ4nJ-QKaE-KPYhz2scdXf0",
  authDomain: "sostenible-a0d92.firebaseapp.com",
  projectId: "sostenible-a0d92",
  storageBucket: "sostenible-a0d92.firebasestorage.app",
  messagingSenderId: "661907919286",
  appId: "1:661907919286:web:aea27714222bb4f314b117",
  measurementId: "G-YM8J1SYHBQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
