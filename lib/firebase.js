/**
 * lib/firebase.js
 * Firebase初期化・db export
 * ab01-9f35a プロジェクト共通
 */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDuPw8nMuFWx8ghV5ZeBGETeiNII3uk4l8",
  authDomain:        "ab01-9f35a.firebaseapp.com",
  projectId:         "ab01-9f35a",
  storageBucket:     "ab01-9f35a.firebasestorage.app",
  messagingSenderId: "502154862201",
  appId:             "1:502154862201:web:4ca0c72225af6bd0147ea8"
};

const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
export const db = getFirestore(app);
