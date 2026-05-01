import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  Save,
  Loader,
} from "lucide-react";
import { apiFetch } from "../utils/api";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  verified: boolean;
  active: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

const MyProfile: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch("/api/auth/user/profile", {
        method: "GET",
      });
      setProfile(response);
      setFormData({
        name: response.name || "",
        phone: response.phone || "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await apiFetch("/api/auth/user/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
        }),
      });

      setProfile(response.user);
      setSuccess("Profile updated successfully!");
      setEditMode(false);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Loader size={40} className="text-blue-600" />
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Failed to load profile
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Profile
        </h2>
        <button
          onClick={() => (editMode ? setEditMode(false) : setEditMode(true))}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            editMode
              ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {editMode ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <p className="text-green-600 dark:text-green-400 text-sm">
            {success}
          </p>
        </motion.div>
      )}

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      >
        {/* Header with avatar */}
        <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end gap-4 -mt-12 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center border-4 border-white dark:border-gray-800">
              <User size={48} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {profile.role}
              </p>
            </div>
          </div>

          {/* Account Status */}
          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Account Status
            </p>
            <div className="flex items-center gap-2">
              {profile.verified ? (
                <>
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="text-green-700 dark:text-green-400 font-medium">
                    Verified
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle size={20} className="text-yellow-600" />
                  <span className="text-yellow-700 dark:text-yellow-400 font-medium">
                    Pending Admin Approval
                  </span>
                </>
              )}
            </div>
            {!profile.active && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                ⚠️ Your account has been deactivated. Please contact support.
              </p>
            )}
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Full Name
              </label>
              {editMode ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              ) : (
                <p className="text-lg text-gray-900 dark:text-white font-medium">
                  {profile.name}
                </p>
              )}
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Mail size={18} className="text-gray-400" />
                <p className="text-gray-900 dark:text-white">{profile.email}</p>
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  Read-only
                </span>
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Phone Number (Optional)
              </label>
              {editMode ? (
                <div className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                  <Phone size={18} className="text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="flex-1 bg-transparent text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Phone size={18} className="text-gray-400" />
                  <p className="text-gray-900 dark:text-white">
                    {profile.phone || "Not provided"}
                  </p>
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Joined
                </p>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Last Updated
                </p>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {new Date(profile.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {editMode && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Account Information Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
      >
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Account Information
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>✓ Your account is secure with email verification</li>
          <li>✓ All your analysis history is stored securely</li>
          <li>✓ Only you can access your analysis data</li>
          <li>✓ Contact support if you need account assistance</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default MyProfile;
