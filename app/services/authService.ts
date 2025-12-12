import apiClient from "./apiClient";
import {
  SignupFormData,
  LoginFormData,
  ForgotPasswordFormData,
  VerifyOtpFormData,
  ResetPasswordFormData,
} from "../schemas/authSchema";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  phoneNumber: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  tempToken?: string;
  resetToken?: string;
  data?: User;
}

export const authService = {
  // Signup
  signup: async (data: SignupFormData): Promise<AuthResponse> => {
    const response = await apiClient.post("/api/v1/auth/signup", data);
    return response.data;
  },

  // Login
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await apiClient.post("/api/v1/auth/login", data);
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (data: ForgotPasswordFormData): Promise<AuthResponse> => {
    const response = await apiClient.post("/api/v1/auth/forgot-password", data);
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (data: VerifyOtpFormData, tempToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post("/api/v1/auth/forgot-password/verify-otp", data, {
      headers: {
        Authorization: `Bearer ${tempToken}`,
      },
    });
    return response.data;
  },

  // Reset Password
  resetPassword: async (data: ResetPasswordFormData, resetToken: string): Promise<AuthResponse> => {
    const response = await apiClient.put("/api/v1/auth/otp/reset", data, {
      headers: {
        Authorization: `Bearer ${resetToken}`,
      },
    });
    return response.data;
  },

  // Resend OTP
  resendOtp: async (email: string): Promise<AuthResponse> => {
    const response = await apiClient.post("/api/v1/auth/forgot-password/otp/resend", { email });
    return response.data;
  },

  // Logout
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
  },
};

export default authService;
