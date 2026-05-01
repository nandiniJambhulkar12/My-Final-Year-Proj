import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  auth,
  googleProvider,
  setupRecaptcha,
  resetRecaptcha,
} from "../firebase";
import { postBackendLogin } from "../utils/api";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  signInWithPhoneNumber,
  ConfirmationResult,
  User,
} from "firebase/auth";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  backendUser?: any | null;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPhoneOtp: (
    phoneNumber: string,
    containerId?: string,
  ) => Promise<ConfirmationResult>;
  verifyPhoneOtp: (
    confirmationResult: ConfirmationResult,
    otp: string,
  ) => Promise<void>;
  resetPhoneAuth: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendUser, setBackendUser] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      // If user is logged in, ensure they're registered in backend and get a token
      if (firebaseUser) {
        try {
          const apiBase =
            process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

          const idToken = await firebaseUser.getIdToken();

          // Try to login with backend using Firebase ID token
          const loginRes = await postBackendLogin(apiBase, {
            id_token: idToken,
          });

          if (loginRes.ok) {
            const data = await loginRes.json();
            localStorage.setItem("userToken", data.access_token);
            // Fetch backend profile to get verification/active state
            try {
              const profileRes = await fetch(
                `${apiBase}/api/auth/user/profile`,
                {
                  headers: { Authorization: `Bearer ${data.access_token}` },
                },
              );
              if (profileRes.ok) {
                const profile = await profileRes.json();
                setBackendUser(profile);
              } else {
                setBackendUser(null);
              }
            } catch (e) {
              console.error("Failed to fetch backend profile", e);
              setBackendUser(null);
            }
          } else {
            const error = await loginRes.json();
            console.error("Backend login failed:", error.detail);
          }
        } catch (err) {
          console.error("Backend authentication error:", err);
        }
      }

      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setBackendUser(null);
      localStorage.removeItem("userToken");
    }
  }, [user]);

  const signup = async (email: string, password: string, name?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });
    // No email verification required - user is signed in directly
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // No email verification check - allow login directly
    } catch (e: any) {
      // Map common Firebase auth errors to friendlier messages so UI can act
      const code = e?.code || "";
      let message = e?.message || "Failed to log in";
      if (code === "auth/wrong-password") message = "Incorrect password";
      else if (code === "auth/user-not-found")
        message = "No account found with that email";
      else if (code === "auth/invalid-email") message = "Invalid email address";
      else if (code === "auth/user-disabled")
        message = "This account has been disabled";
      else if (code === "auth/account-exists-with-different-credential")
        message =
          "An account exists with a different sign-in method. Try signing in with the provider you used (e.g. Google).";

      const err: any = new Error(message);
      err.code = code;
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const sendPhoneOtp = async (
    phoneNumber: string,
    containerId: string = "recaptcha-container",
  ): Promise<ConfirmationResult> => {
    try {
      // Setup fresh reCAPTCHA verifier
      const recaptchaVerifier = setupRecaptcha(containerId);

      // Send OTP via Firebase
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier,
      );
      return confirmationResult;
    } catch (error: any) {
      // Reset reCAPTCHA on error so user can retry
      resetRecaptcha();

      // Map error codes to user-friendly messages
      const code = error?.code || "";
      let message = error?.message || "Failed to send OTP";

      if (code === "auth/invalid-phone-number") {
        message =
          "Invalid phone number format. Please include country code (e.g., +91XXXXXXXXXX)";
      } else if (code === "auth/too-many-requests") {
        message = "Too many attempts. Please try again later.";
      } else if (code === "auth/quota-exceeded") {
        message = "SMS quota exceeded. Please try again later.";
      } else if (code === "auth/captcha-check-failed") {
        message = "reCAPTCHA verification failed. Please try again.";
      } else if (code === "auth/missing-phone-number") {
        message = "Please enter a phone number.";
      } else if (code === "auth/billing-not-enabled") {
        message =
          "Phone authentication requires Firebase Blaze plan. Please enable billing.";
      }

      const err: any = new Error(message);
      err.code = code;
      throw err;
    }
  };

  const verifyPhoneOtp = async (
    confirmationResult: ConfirmationResult,
    otp: string,
  ) => {
    try {
      await confirmationResult.confirm(otp);
    } catch (error: any) {
      const code = error?.code || "";
      let message = error?.message || "Failed to verify OTP";

      if (code === "auth/invalid-verification-code") {
        message = "Invalid OTP. Please check and try again.";
      } else if (code === "auth/code-expired") {
        message = "OTP has expired. Please request a new one.";
      }

      const err: any = new Error(message);
      err.code = code;
      throw err;
    }
  };

  const resetPhoneAuth = () => {
    resetRecaptcha();
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      backendUser,
      signup,
      login,
      loginWithGoogle,
      sendPhoneOtp,
      verifyPhoneOtp,
      resetPhoneAuth,
      logout,
    }),
    [user, loading, backendUser],
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
