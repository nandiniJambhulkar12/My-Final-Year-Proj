import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { validatePassword, passwordStrengthLabel } from "../utils/password";
import { ConfirmationResult } from "firebase/auth";
import axios from "axios";
import { auth } from "../firebase";

const RESEND_COOLDOWN_SECONDS = 30;

const Signup: React.FC = () => {
  const {
    signup,
    loginWithGoogle,
    sendPhoneOtp,
    verifyPhoneOtp,
    resetPhoneAuth,
  } = useAuth();
  const navigate = useNavigate();

  // Tab state: 'email' or 'phone'
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");

  // Email signup state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwCheck, setPwCheck] = useState<
    { id: string; pass: boolean; message: string }[]
  >([]);
  const [pwValid, setPwValid] = useState(false);
  const [pwStrength, setPwStrength] = useState("");

  // Phone signup state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [consentChecked, setConsentChecked] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Common state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const normalizePhoneNumber = (value: string): string => {
    const trimmed = value.trim();
    if (trimmed.startsWith("+")) {
      return `+${trimmed.slice(1).replace(/\D/g, "")}`;
    }
    return `${countryCode}${trimmed.replace(/\D/g, "")}`;
  };

  const validatePhoneForOtp = (rawPhone: string): string | null => {
    if (!consentChecked) {
      return "Please confirm SMS consent before continuing.";
    }

    if (!rawPhone || rawPhone.replace(/\D/g, "").length < 6) {
      return "Please enter a valid phone number.";
    }

    const normalized = normalizePhoneNumber(rawPhone);
    if (!/^\+[1-9]\d{5,14}$/.test(normalized)) {
      return "Enter a valid phone number in E.164 format (for example: +919876543210).";
    }

    return null;
  };

  const loginToBackendWithCurrentUser = async (): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error(
        "Signed in to Firebase, but no active user session found.",
      );
    }

    const idToken = await currentUser.getIdToken();
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/auth/login`,
      {
        id_token: idToken,
      },
    );

    localStorage.setItem("userToken", response.data.access_token);
  };

  const registerPhoneUserInBackend = async (
    fullPhoneNumber: string,
  ): Promise<void> => {
    const currentUser = auth.currentUser;
    const registrationEmail =
      currentUser?.email ||
      `${fullPhoneNumber.replace(/[^\d+]/g, "")}@phone.auth`;
    const registrationName =
      currentUser?.displayName || currentUser?.phoneNumber || fullPhoneNumber;

    await axios.post(
      `${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/auth/register`,
      {
        email: registrationEmail,
        name: registrationName,
      },
    );
  };

  // Cleanup reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      resetPhoneAuth();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const intervalId = window.setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [resendCountdown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please fill all required fields");
      return;
    }
    if (!pwValid) {
      setError("Please meet all password rules");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // Firebase signup
      await signup(email, password, name);

      // Register user with backend
      try {
        await axios.post(
          `${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/auth/register`,
          {
            email,
            name,
          },
        );
      } catch (err) {
        console.error("Backend registration error:", err);
        // Continue anyway, user account is created in Firebase
      }

      setSuccessMessage("Account created! Waiting for admin verification...");
      setTimeout(() => {
        navigate("/verification-pending", { replace: true, state: { email } });
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (v: string) => {
    setPassword(v);
    const res = validatePassword(v);
    setPwCheck(res.results as { id: string; pass: boolean; message: string }[]);
    setPwValid(res.valid);
    setPwStrength(passwordStrengthLabel(v));
  };

  const requestOtp = async () => {
    setError(null);
    setSuccessMessage(null);

    const phoneValidationError = validatePhoneForOtp(phoneNumber);
    if (phoneValidationError) {
      setError(phoneValidationError);
      return;
    }

    const fullPhoneNumber = normalizePhoneNumber(phoneNumber);
    setLoading(true);

    try {
      const result = await sendPhoneOtp(fullPhoneNumber, "recaptcha-container");
      setConfirmationResult(result);
      setOtpSent(true);
      setResendCountdown(RESEND_COOLDOWN_SECONDS);
      setSuccessMessage("OTP sent successfully! Check your phone.");
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestOtp();
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || loading) return;
    await requestOtp();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    if (!confirmationResult) {
      setError("Please request OTP first");
      return;
    }

    setLoading(true);
    try {
      await verifyPhoneOtp(confirmationResult, otp);
      await loginToBackendWithCurrentUser();

      const fullPhoneNumber = normalizePhoneNumber(phoneNumber);
      try {
        await registerPhoneUserInBackend(fullPhoneNumber);
      } catch (backendRegisterErr: any) {
        const backendMessage = backendRegisterErr?.response?.data?.detail;
        if (backendMessage) {
          throw new Error(backendMessage);
        }
        throw backendRegisterErr;
      }

      setSuccessMessage("Account created! Waiting for admin verification...");
      setTimeout(() => {
        navigate("/verification-pending", {
          replace: true,
          state: { email: auth.currentUser?.email || undefined },
        });
      }, 1500);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.detail ||
        err?.message ||
        "Invalid OTP. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();

      // Register user with backend
      // Note: You'll need to get user info from auth context
      setSuccessMessage("Account created! Waiting for admin verification...");
      setTimeout(() => {
        navigate("/verification-pending", { replace: true });
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const resetPhoneState = () => {
    setOtpSent(false);
    setConfirmationResult(null);
    setOtp("");
    setSuccessMessage(null);
    setError(null);
    setResendCountdown(0);
    setConsentChecked(false);
    resetPhoneAuth();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Sign up
        </h2>

        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container"></div>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
            {successMessage}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === "email"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
            onClick={() => {
              setActiveTab("email");
              setError(null);
              resetPhoneState();
            }}
          >
            Email & Password
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === "phone"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
            onClick={() => {
              setActiveTab("phone");
              setError(null);
            }}
          >
            Phone Number
          </button>
        </div>

        {activeTab === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                placeholder="Enter your password"
              />
              <div className="mt-2 text-sm">
                <div className="mb-1">
                  Strength: <strong>{pwStrength || "—"}</strong>
                </div>
                <ul className="text-xs space-y-1">
                  {pwCheck.map((r) => (
                    <li
                      key={r.id}
                      className={r.pass ? "text-green-600" : "text-gray-500"}
                    >
                      {r.pass ? "✓" : "○"} {r.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Confirm your password"
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading || !pwValid || password !== confirmPassword}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="input-field w-24"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      <option value="+91">+91 🇮🇳</option>
                      <option value="+1">+1 🇺🇸</option>
                      <option value="+44">+44 🇬🇧</option>
                      <option value="+61">+61 🇦🇺</option>
                      <option value="+86">+86 🇨🇳</option>
                      <option value="+81">+81 🇯🇵</option>
                    </select>
                    <input
                      type="tel"
                      className="input-field flex-1"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter number (e.g. 9876543210 or +919876543210)"
                    />
                  </div>
                </div>
                <label className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                  />
                  <span>
                    I agree to receive an SMS verification code. Standard SMS
                    rates may apply.
                  </span>
                </label>
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Enter OTP sent to {countryCode}
                    {phoneNumber}
                  </label>
                  <input
                    type="text"
                    className="input-field text-center text-xl tracking-widest"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify OTP & Sign up"}
                </button>
                <button
                  type="button"
                  className="text-sm text-primary-600 hover:underline w-full text-center"
                  onClick={resetPhoneState}
                >
                  Change phone number
                </button>
                <button
                  type="button"
                  className="text-sm text-primary-600 hover:underline w-full text-center disabled:text-gray-400 disabled:no-underline"
                  onClick={handleResendOtp}
                  disabled={loading || resendCountdown > 0}
                >
                  {resendCountdown > 0
                    ? `Resend OTP in ${resendCountdown}s`
                    : "Resend OTP"}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="my-4 flex items-center">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="mx-3 text-sm text-gray-500">or</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="space-y-3">
          <button
            onClick={handleGoogle}
            className="btn-secondary w-full"
            disabled={loading}
          >
            Continue with Google
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-600">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
