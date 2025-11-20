import apiClient from "./apiClient";

export interface UserProfile {
  _id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  role: string;
  isAccountDeleted: boolean;
}

export interface UpdateProfileData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export const accountService = {
  // Get current user profile
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.get("/api/v1/status/profile");
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<ApiResponse> => {
    const response = await apiClient.patch("/api/v1/account/profile", data);
    return response.data;
  },

  // Update password
  updatePassword: async (data: UpdatePasswordData): Promise<ApiResponse> => {
    const response = await apiClient.patch("/api/v1/account/password", data);
    return response.data;
  },

  // Delete account
  deleteAccount: async (): Promise<ApiResponse> => {
    const response = await apiClient.delete("/api/v1/account/delete");
    return response.data;
  },
};

export default accountService;
