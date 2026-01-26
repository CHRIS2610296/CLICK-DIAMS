// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // <--- Add this
// REPLACE THIS WITH YOUR ACTUAL FIREBASE CONFIG FROM STEP 1
const firebaseConfig = {apiKey: "AIzaSyAX8kfl_AnyncAvEiKgHOhc2Mm3G0cHNCA",
  authDomain: "click-diams.firebaseapp.com",
  projectId: "click-diams",
  storageBucket: "click-diams.firebasestorage.app",
  messagingSenderId: "394019997192",
  appId: "1:394019997192:web:cd3e9cf38733348ad733bd",
  measurementId: "G-XBXJ0T4M51"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);