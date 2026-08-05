"use client";

import {
  Call02Icon,
  Cancel01Icon,
  FloppyDiskIcon,
  Mail01Icon,
  PencilEdit02Icon,
  SquareLock02Icon,
  UserCircleIcon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import accountService from "../../services/accountService";

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    role: user?.role || "Admin",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        role: user.role || "Admin",
      });
    }
  }, [user]);

  if (!isAuthenticated || user?.role !== "Admin") {
    return null;
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await accountService.updateProfile({
        fullName: profileData.fullName,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber,
      });
      if (!response.success) {
        throw new Error(response.message || "Failed to update profile");
      }
      updateUser({
        ...user!,
        fullName: profileData.fullName,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber,
      });
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const typed = err as { response?: { data?: { message?: string } }; message?: string };
      setError(typed.response?.data?.message || typed.message || "Failed to update profile");
      setTimeout(() => setError(""), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      role: user?.role || "Admin",
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match!");
      setTimeout(() => setError(""), 5000);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await accountService.updatePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (!response.success) {
        throw new Error(response.message || "Failed to change password");
      }
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
      setSuccess("Password changed successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const typed = err as { response?: { data?: { message?: string } }; message?: string };
      setError(typed.response?.data?.message || typed.message || "Failed to change password");
      setTimeout(() => setError(""), 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      {/* Toast Notifications */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-[#faf9f5] px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-[#faf9f5] px-6 py-3 rounded-lg shadow-lg">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#222222]">Admin Profile</h1>
          <p className="text-[#5d6043] mt-1">Manage your profile settings</p>
        </div>

        {/* Profile Card */}
        <div className="bg-[#faf9f5] rounded-2xl shadow-sm border border-[#b9aca2]/40 overflow-hidden">
          {/* Banner */}
          <div className="h-32"></div>

          {/* Profile Content */}
          <div className="px-6 pb-6">
            {/* Profile Picture */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-6">
              <div className="flex items-end gap-4">
                <div className="w-32 h-32 bg-[#faf9f5] rounded-full border-4 border-[#faf9f5] shadow-lg flex items-center justify-center">
                  <AdminIcon icon={UserCircleIcon} size={112} className="text-[#b9aca2]" />
                </div>
                <div className="mb-2">
                  <h2 className="text-2xl font-bold text-[#222222]">{profileData.fullName}</h2>
                  <p className="text-[#5d6043]">{profileData.role}</p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-[#5d6043] text-[#faf9f5] rounded-lg hover:bg-[#222222] transition-colors"
                >
                  <AdminIcon icon={PencilEdit02Icon} size={16} />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-[#222222] mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#5d6043] mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, fullName: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
                        required
                      />
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#faf9f5] rounded-lg">
                        <AdminIcon icon={UserCircleIcon} size={20} className="text-[#b9aca2]" />
                        <span className="text-[#222222]">{profileData.fullName}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5d6043] mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({ ...profileData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
                        required
                      />
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#faf9f5] rounded-lg">
                        <AdminIcon icon={Mail01Icon} size={20} className="text-[#b9aca2]" />
                        <span className="text-[#222222]">{profileData.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5d6043] mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phoneNumber}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phoneNumber: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
                        placeholder="+233 20 123 4567"
                      />
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#faf9f5] rounded-lg">
                        <AdminIcon icon={Call02Icon} size={20} className="text-[#b9aca2]" />
                        <span className="text-[#222222]">
                          {profileData.phoneNumber || "Not provided"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5d6043] mb-2">Role</label>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#faf9f5] rounded-lg">
                      <AdminIcon icon={UserCircleIcon} size={20} className="text-[#b9aca2]" />
                      <span className="text-[#222222]">{profileData.role}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4 border-t border-[#b9aca2]/60">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-6 py-2 border border-[#b9aca2] rounded-lg hover:bg-[#faf9f5] transition-colors"
                  >
                    <AdminIcon icon={Cancel01Icon} size={16} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-[#5d6043] text-[#faf9f5] rounded-lg hover:bg-[#222222] transition-colors disabled:opacity-60"
                  >
                    <AdminIcon icon={FloppyDiskIcon} size={16} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-[#faf9f5] rounded-2xl shadow-sm border border-[#b9aca2]/40 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[#222222]">Security Settings</h3>
              <p className="text-sm text-[#5d6043] mt-1">Manage your password and security</p>
            </div>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#b9aca2] text-[#5d6043] rounded-lg hover:bg-[#b9aca2] transition-colors"
              >
                <AdminIcon icon={SquareLock02Icon} size={16} />
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-[#5d6043] mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b9aca2] hover:text-[#5d6043]"
                  >
                    {showCurrentPassword ? (
                      <AdminIcon icon={ViewOffSlashIcon} size={20} />
                    ) : (
                      <AdminIcon icon={ViewIcon} size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5d6043] mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b9aca2] hover:text-[#5d6043]"
                  >
                    {showNewPassword ? (
                      <AdminIcon icon={ViewOffSlashIcon} size={20} />
                    ) : (
                      <AdminIcon icon={ViewIcon} size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5d6043] mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-[#b9aca2] rounded-lg hover:bg-[#faf9f5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#5d6043] text-[#faf9f5] rounded-lg hover:bg-[#222222] transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
