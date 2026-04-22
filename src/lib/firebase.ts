/**
 * @file lib/firebase.ts
 * @description Integration and initialization wrapper for Google Firebase.
 * 
 * Sets up a Firestore instance. Since this relies on USER environment variables,
 * a robust application must gracefully handle the absence of a Firebase config.
 * We export an initialized `db` object representing our Firestore instance.
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// The USER must provide these in their .env.local file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mock-sender",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "mock-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// For Offline resilience (optional but great for UX!)
// enableIndexedDbPersistence(db).catch(err => {
//     console.warn("Offline persistence not enabled:", err);
// });

/** The name of the collection we will store recipes in */
export const RECIPES_COLLECTION = "recipes";

// Helper collection reference to be used by our store/services
export const recipesColRef = collection(db, RECIPES_COLLECTION);
