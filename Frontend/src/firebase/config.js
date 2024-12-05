
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBgWpNvFZUE_nnWwWD_gYghnl38VY90mZs",
  authDomain: "growthz.firebaseapp.com",
  projectId: "growthz",
  storageBucket: "growthz.firebasestorage.app",
  messagingSenderId: "828591536697",
  appId: "1:828591536697:web:ef88c83332e6d60fc46be8",
  measurementId: "G-1HNX203DJJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);