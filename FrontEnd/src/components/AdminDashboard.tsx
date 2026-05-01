import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface User {
  id: string;
  email: string;
  name: string;
  verified: boolean;
  active: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "verified" | "pending"
  >("all");

  const adminToken = localStorage.getItem("adminToken");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );
      setUsers(response.data.users);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detail || "Failed to fetch users";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin-login", { replace: true });
      return;
    }
    fetchUsers();
  }, [adminToken, navigate, fetchUsers]);

  const handleVerifyUser = async (userId: string, verified: boolean) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/admin/users/${userId}/verify`,
        null,
        {
          params: { verified },
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );
      setSuccessMessage(response.data.message);
      fetchUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detail || "Failed to update user";
      setError(errorMessage);
    }
  };

  const handleActivateUser = async (userId: string, active: boolean) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/admin/users/${userId}/activate`,
        null,
        {
          params: { active },
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );
      setSuccessMessage(response.data.message);
      fetchUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detail || "Failed to update user";
      setError(errorMessage);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/admin/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );
      setSuccessMessage(response.data.message);
      fetchUsers();
      setShowModal(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detail || "Failed to delete user";
      setError(errorMessage);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    navigate("/admin-login", { replace: true });
  };

  const filteredUsers = users.filter((user) => {
    if (filterStatus === "verified") return user.verified;
    if (filterStatus === "pending") return !user.verified;
    return true;
  });

  const stats = {
    total: users.length,
    verified: users.filter((u) => u.verified).length,
    pending: users.filter((u) => !u.verified).length,
    active: users.filter((u) => u.active).length,
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-6">
            <p className="text-green-300">{successMessage}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Verified</p>
            <p className="text-3xl font-bold text-green-400 mt-2">
              {stats.verified}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-3xl font-bold text-yellow-400 mt-2">
              {stats.pending}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Active</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">
              {stats.active}
            </p>
          </div>
        </div>

        {/* Filter and Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {/* Filter */}
          <div className="px-6 py-4 border-b border-gray-700 flex gap-4">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg transition ${
                filterStatus === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setFilterStatus("verified")}
              className={`px-4 py-2 rounded-lg transition ${
                filterStatus === "verified"
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Verified ({stats.verified})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-lg transition ${
                filterStatus === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Pending ({stats.pending})
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Active
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-700/50 transition"
                    >
                      <td className="px-6 py-4 text-sm text-white">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.verified ? (
                          <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-xs font-medium">
                            Verified
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.active ? (
                          <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-900/30 text-red-400 rounded-full text-xs font-medium">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-xs"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* User Management Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Manage User</h2>
            <div className="space-y-2 mb-6">
              <p className="text-gray-300">
                <strong>Name:</strong> {selectedUser.name}
              </p>
              <p className="text-gray-300">
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p className="text-gray-300">
                <strong>Status:</strong>{" "}
                {selectedUser.verified ? "Verified" : "Pending"}
              </p>
              <p className="text-gray-300">
                <strong>Active:</strong> {selectedUser.active ? "Yes" : "No"}
              </p>
            </div>

            <div className="space-y-3">
              {!selectedUser.verified && (
                <button
                  onClick={() => handleVerifyUser(selectedUser.id, true)}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  ✓ Verify User
                </button>
              )}
              {selectedUser.verified && (
                <button
                  onClick={() => handleVerifyUser(selectedUser.id, false)}
                  className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition"
                >
                  ✗ Reject User
                </button>
              )}

              {selectedUser.active && (
                <button
                  onClick={() => handleActivateUser(selectedUser.id, false)}
                  className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
                >
                  Deactivate User
                </button>
              )}
              {!selectedUser.active && (
                <button
                  onClick={() => handleActivateUser(selectedUser.id, true)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Activate User
                </button>
              )}

              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Delete User
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
