import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCiGkCCXDl4wID4tWOZFpNFpcraWkgccDs",
  authDomain: "ckeys-28750.firebaseapp.com",
  projectId: "ckeys-28750",
  storageBucket: "ckeys-28750.firebasestorage.app",
  messagingSenderId: "809643703173",
  appId: "1:809643703173:web:ca7fde3394f6dd0bb222ec"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);