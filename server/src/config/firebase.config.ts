import admin from "firebase-admin";
import { env } from "./env.config";

let app: admin.app.App | null = null;

export function getFirebaseAdmin(): admin.app.App {
  if (!env.firebaseProjectId || !env.firebaseClientEmail || !env.firebasePrivateKey) {
    throw new Error("Firebase is not configured. Set FIREBASE_* environment variables.");
  }
  if (!app) {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebaseProjectId,
        clientEmail: env.firebaseClientEmail,
        privateKey: env.firebasePrivateKey,
      }),
    });
  }
  return app;
}

export function isFirebaseConfigured(): boolean {
  return Boolean(env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey);
}
