import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD2YbJ-ghOkZjutYDT4Mcio9bJt35r3ct0",
  authDomain: "ericodata.firebaseapp.com",
  projectId: "ericodata",
  storageBucket: "ericodata.firebasestorage.app",
  messagingSenderId: "553928656038",
  appId: "1:553928656038:web:f54bdab4feff5498c9a067",
  measurementId: "G-CMCV51S7E7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore
export const db = getFirestore(app);
//Initialize authentication
export const auth = getAuth(app);
//Set up Google Auth
export const googleProvider = new GoogleAuthProvider();
