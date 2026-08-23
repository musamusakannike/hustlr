"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

function ensureFirebaseConfig() {
  const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"] as const;
  const missingKey = requiredKeys.find((key) => !firebaseConfig[key]);

  if (missingKey) {
    throw new Error(
      "Google sign-in is not configured. Add the Firebase public environment variables.",
    );
  }
}

function getFirebaseAuth() {
  ensureFirebaseConfig();
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}

export async function getGoogleIdToken() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(getFirebaseAuth(), provider);
  return result.user.getIdToken();
}
