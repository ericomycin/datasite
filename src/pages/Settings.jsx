import { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import {
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import NavigationBar from "../components/NavigationBar";
import { useAuth } from "../hooks/useAuth";

export default function Settings() {
  const { userData, setUserData } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || "",
        email: userData.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [userData]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");

      // Update email if changed
      if (formData.email !== userData.email) {
        await updateEmail(user, formData.email);
      }

      // Update Firestore
      await updateDoc(doc(db, "users", userData.userId), {
        fullName: formData.fullName,
        email: formData.email,
      });

      // Update local state
      setUserData((prev) => ({
        ...prev,
        fullName: formData.fullName,
        email: formData.email,
      }));

      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("New passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");

      // Reauthenticate
      const credential = EmailAuthProvider.credential(
        user.email,
        formData.currentPassword,
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, formData.newPassword);

      setMessage("Password updated successfully!");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage("Error updating password: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#F3F4F6]">
      <div className="h-full bg-white overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          <NavigationBar
            activeTab="settings"
            setActiveTab={() => {}}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            handleSignOut={handleSignOut}
          />

          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800">Settings</h3>
              <p className="text-sm text-slate-500">
                Update your account details and password
              </p>
            </div>

            {message && (
              <div
                className={`mb-6 p-4 rounded-lg ${message.includes("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
              >
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
              {/* Profile Update */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">
                  Update Profile
                </h4>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 transition-colors font-medium"
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </button>
                </form>
              </div>

              {/* Password Update */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">
                  Change Password
                </h4>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      required
                      minLength="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 transition-colors font-medium"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
