// src/firebase/config.js
// Connects our app to Firebase. Owned by Person 2.
//
// HOW TO FILL THIS IN:
// Firebase console → ⚙️ Project settings → "Your apps" → Web app → "SDK setup and configuration" → Config
// Copy the values from there into the object below.
//
// (It's OK for this config to be on GitHub — it only identifies our project.
//  Never put Azure / OpenAI / ElevenLabs keys in this file though.)

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFzbmlPsM1CnNnTVD3zHRx7Shl3cDsyxw",
  authDomain: "bug-bloom.firebaseapp.com",
  projectId: "bug-bloom",
  storageBucket: "bug-bloom.firebasestorage.app",
  messagingSenderId: "960917106139",
  appId: "1:960917106139:web:acc193ff174efc9e51cbfe",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
