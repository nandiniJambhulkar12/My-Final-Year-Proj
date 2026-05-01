import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

interface LocationState {
  email?: string;
}

const VerificationPending: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const state = location.state as LocationState;

  useEffect(() => {
    if (state?.email) {
      setEmail(state.email);
    }
  }, [state]);

  const checkVerificationStatus = useCallback(async () => {
    if (!email || checking) return;

    setChecking(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/auth/verify-status`,
        {
          email,
        },
      );

      if (response.data.verified) {
        setVerified(true);
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      }
      setLastChecked(new Date());
    } catch (err) {
      console.error("Error checking verification status:", err);
    } finally {
      setChecking(false);
    }
  }, [email, checking, navigate]);

  useEffect(() => {
    if (!email) return;

    // Check verification status every 5 seconds
    const interval = setInterval(() => {
      checkVerificationStatus();
    }, 5000);

    // Check immediately on mount
    checkVerificationStatus();

    return () => clearInterval(interval);
  }, [email, checkVerificationStatus]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 rounded-full p-4">
                <svg
                  className="w-12 h-12 text-white animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Verification Pending
            </h1>
            <p className="text-orange-100 mt-2">
              Your account is awaiting admin approval
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {verified ? (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-700 dark:text-green-300">
                    ✓ Your account has been verified! Redirecting to login...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <strong>Email:</strong>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 break-all">
                    {email}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    <strong>What happens next?</strong>
                  </p>
                  <ul className="text-blue-600 dark:text-blue-400 text-sm mt-3 space-y-2">
                    <li>• An admin will review your account</li>
                    <li>• You'll be notified once verified</li>
                    <li>• This usually takes a few minutes</li>
                    <li>• We're checking automatically every 5 seconds</li>
                  </ul>
                </div>

                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                    Last checked:{" "}
                    {lastChecked
                      ? lastChecked.toLocaleTimeString()
                      : "checking..."}
                  </p>
                  <button
                    onClick={checkVerificationStatus}
                    disabled={checking}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checking ? "Checking..." : "Check Now"}
                  </button>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    <strong>Didn't receive verification?</strong>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                    Contact support at support@xai-auditor.com or wait for admin
                    approval.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VerificationPending;
