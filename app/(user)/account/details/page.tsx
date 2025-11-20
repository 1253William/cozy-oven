"use client";

import { useState, useEffect } from "react";
import { Save, Trash2, User } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import accountService, { UpdateProfileData } from "@/app/services/accountService";
import { useRouter } from "next/navigation";

export default function AccountDetailsPage() {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<UpdateProfileData>({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: "",
  });

  useEffect(() => {
    // Fetch full profile with phone number
    const fetchProfile = async () => {
      try {
        const response = await accountService.getProfile();
        if (response.success && response.data) {
          setFormData({
            fullName: response.data.fullName,
            email: response.data.email,
            phoneNumber: response.data.phoneNumber || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await accountService.updateProfile(formData);
      if (response.success) {
        // Update local user context
        if (user) {
          updateUser({
            ...user,
            fullName: formData.fullName || user.fullName,
            email: formData.email || user.email,
          });
        }
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await accountService.deleteAccount();
      if (response.success) {
        logout();
        router.push("/");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Account Details</h1>
        <p className="text-gray-600 mt-2">Manage your personal information</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {success}
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent ${
              !isEditing ? "bg-gray-50 text-gray-600" : ""
            }`}
            placeholder="John Doe"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent ${
              !isEditing ? "bg-gray-50 text-gray-600" : ""
            }`}
            placeholder="john@example.com"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent ${
              !isEditing ? "bg-gray-50 text-gray-600" : ""
            }`}
            placeholder="+233 123 456 789"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-[#2A2C22] text-white font-semibold rounded-lg hover:bg-[#1a1c12] transition-colors disabled:bg-gray-400"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                  setSuccess(null);
                  // Reset form data to user data
                  setFormData({
                    fullName: user?.fullName || "",
                    email: user?.email || "",
                    phoneNumber: formData.phoneNumber,
                  });
                }}
                disabled={isSaving}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#2A2C22] text-white font-semibold rounded-lg hover:bg-[#1a1c12] transition-colors"
            >
              <User className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Delete Account Section */}
        <div className="pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Danger Zone</h2>
          <p className="text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-6 py-3 border-2 border-red-500 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold mb-4">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
