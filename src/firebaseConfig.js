import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // <--- Add this

const firebaseConfig = {
  // ... keep your existing config keys here ...
  apiKey: "AIzaSyAX8kfl_AnyncAvEiKgHOhc2Mm3G0cHNCA",
  authDomain: "click-diams.firebaseapp.com",
  projectId: "click-diams",
  storageBucket: "click-diams.firebasestorage.app", // Make sure this line exists!
  messagingSenderId: "394019997192",
  appId: "1:394019997192:web:cd3e9cf38733348ad733bd",
  measurementId: "G-XBXJ0T4M51"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // <--- Export this