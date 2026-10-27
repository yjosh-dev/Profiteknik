import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDtfdBr5WETjQWgSvoJskBrga7Rh5HSNc",
  authDomain: "profiteknik.firebaseapp.com",
  projectId: "profiteknik",
  storageBucket: "profiteknik.firebasestorage.app",
  messagingSenderId: "630732626392",
  appId: "1:630732626392:web:05eecac6a9043d84a9faad",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);