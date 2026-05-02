// Firebase initialization
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  EmailAuthProvider,
  RecaptchaVerifier,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration is read from environment variables to avoid
// committing secrets into the repository. Create a `.env` file with the
// variables shown in `.env.example` at project root.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "demo-api-key",
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
    "demo-project.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  measurementId:
    process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX",
};

// Check if Firebase config is valid (not using demo values)
const isFirebaseConfigured =
  process.env.REACT_APP_FIREBASE_API_KEY &&
  process.env.REACT_APP_FIREBASE_API_KEY !== "demo-api-key";

// Initialize Firebase (client-side only)
let app;
try {
  app = initializeApp(firebaseConfig);
  if (!isFirebaseConfigured) {
    console.warn(
      "⚠️ Firebase is using demo/placeholder configuration. Please set up your Firebase project and add credentials to .env file.",
    );
  }
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  // Create a minimal app config to prevent crashes
  app = initializeApp({
    apiKey: "demo-api-key",
    authDomain: "demo.firebaseapp.com",
    projectId: "demo",
    storageBucket: "demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:demo",
  });
  console.warn(
    "⚠️ Using fallback Firebase configuration. Authentication features may not work.",
  );
}

// Initialize Firebase services
export const auth = getAuth(app);
auth.useDeviceLanguage();
// Persist auth in browser local storage; handle failure gracefully
setPersistence(auth, browserLocalPersistence).catch(() => {
  // ignore persistence errors (e.g., in non-browser envs)
});

let analyticsInstance = null;
try {
  // getAnalytics requires window and measurementId; guard for non-browser envs
  if (typeof window !== "undefined" && firebaseConfig.measurementId) {
    analyticsInstance = getAnalytics(app);
  }
} catch (e) {
  // ignore analytics initialization errors
}
export const analytics = analyticsInstance;

// Initialize providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const emailProvider = new EmailAuthProvider();

// Setup invisible reCAPTCHA for phone auth
// This function creates a new RecaptchaVerifier each time to avoid stale state
export const setupRecaptcha = (containerId = "recaptcha-container") => {
  if (typeof window === "undefined") return null;

  // Clear any existing verifier to prevent issues
  if (window.recaptchaVerifier) {
    try {
      // RecaptchaVerifier exposes a .clear() method
      window.recaptchaVerifier.clear();
    } catch (e) {
      // Ignore errors during cleanup
    }
    window.recaptchaVerifier = null;
  }

  // Create new RecaptchaVerifier using modular API signature.
  try {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      containerId,
      {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber
        },
        "expired-callback": () => {
          // Response expired. Ask user to solve reCAPTCHA again.
        },
      },
      auth,
    );
  } catch (e) {
    // If Recaptcha cannot be created (e.g., environment issues), leave null
    window.recaptchaVerifier = null;
  }

  return window.recaptchaVerifier;
};

// Reset reCAPTCHA for retry
export const resetRecaptcha = () => {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      // Ignore errors
    }
    window.recaptchaVerifier = null;
  }
};

export default app;
