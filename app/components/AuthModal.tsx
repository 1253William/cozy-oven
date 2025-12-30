"use client";

import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  SignupFormData,
  LoginFormData,
  ForgotPasswordFormData,
  VerifyOtpFormData,
  ResetPasswordFormData,
} from "../schemas/authSchema";
import authService from "../services/authService";
import { useAuth } from "../context/AuthContext";

type AuthTab = "login" | "signup" | "forgot-password" | "verify-otp" | "reset-password";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: AuthTab;
}

export default function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState<string>("");
  const [resetToken, setResetToken] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { login } = useAuth();

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Signup form
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "Customer",
    },
  });

  // Forgot password form
  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Verify OTP form
  const verifyOtpForm = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
  });

  // Reset password form
  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const resetForms = () => {
    loginForm.reset();
    signupForm.reset();
    forgotPasswordForm.reset();
    verifyOtpForm.reset();
    resetPasswordForm.reset();
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    resetForms();
    setActiveTab("login");
    onClose();
  };

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    setError("");
    try {
      const response = await authService.login(data);
      if (response.success && response.accessToken && response.data) {
        login(response.data, response.accessToken);
        setSuccess(response.message);
        setTimeout(() => {
          handleClose();
        }, 1000);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setLoading(true);
    setError("");
    try {
      const response = await authService.signup(data);
      if (response.success) {
        setSuccess(response.message);
        // For signup, we might receive a tempToken if account needs verification
        if (response.tempToken) {
          setTempToken(response.tempToken);
        }
        // Switch to login tab after successful signup
        setTimeout(() => {
          setActiveTab("login");
          resetForms();
        }, 2000);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError("");
    try {
      const response = await authService.forgotPassword(data);
      if (response.success && response.tempToken) {
        setTempToken(response.tempToken);
        setUserEmail(data.email);
        setSuccess(response.message);
        setTimeout(() => {
          setActiveTab("verify-otp");
          setSuccess("");
        }, 1500);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (data: VerifyOtpFormData) => {
    setLoading(true);
    setError("");
    try {
      const response = await authService.verifyOtp(data, tempToken);
      if (response.success && response.resetToken) {
        setResetToken(response.resetToken);
        setSuccess(response.message);
        setTimeout(() => {
          setActiveTab("reset-password");
          setSuccess("");
        }, 1500);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setLoading(true);
    setError("");
    try {
      const response = await authService.resetPassword(data, resetToken);
      if (response.success) {
        setSuccess(response.message);
        setTimeout(() => {
          setActiveTab("login");
          resetForms();
          setTempToken("");
          setResetToken("");
        }, 2000);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authService.resendOtp(userEmail);
      if (response.success && response.tempToken) {
        setTempToken(response.tempToken);
        setSuccess("OTP has been resent to your email.");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === "login" && "Welcome Back"}
                {activeTab === "signup" && "Create Account"}
                {activeTab === "forgot-password" && "Reset Password"}
                {activeTab === "verify-otp" && "Verify OTP"}
                {activeTab === "reset-password" && "New Password"}
              </h2>
              <p className="text-gray-600 mt-2">
                {activeTab === "login" && "Sign in to continue to Cozy Oven"}
                {activeTab === "signup" && "Join us and start ordering delicious treats"}
                {activeTab === "forgot-password" && "We'll send you a code to reset your password"}
                {activeTab === "verify-otp" && "Enter the 5-digit code sent to your email"}
                {activeTab === "reset-password" && "Create a new secure password"}
              </p>
            </div>

            {/* Error and Success messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    {...loginForm.register("email")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                    placeholder="you@example.com"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      {...loginForm.register("password")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("forgot-password");
                    resetForms();
                  }}
                  className="text-sm text-[#2A2C22] hover:underline"
                >
                  Forgot password?
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2A2C22] text-white py-3 rounded-full font-semibold hover:bg-[#1a1c12] transition disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("signup");
                      resetForms();
                    }}
                    className="text-[#2A2C22] font-semibold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </form>
            )}

            {/* Signup Form */}
            {activeTab === "signup" && (
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    {...signupForm.register("fullName")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                    placeholder="Jane Doe"
                  />
                  {signupForm.formState.errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {signupForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    {...signupForm.register("email")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                    placeholder="you@example.com"
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    {...signupForm.register("phoneNumber")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                    placeholder="0205345678"
                  />
                  {signupForm.formState.errors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {signupForm.formState.errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      {...signupForm.register("password")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent pr-10"
                      placeholder="********"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showSignupPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2A2C22] text-white py-3 rounded-full font-semibold hover:bg-[#1a1c12] transition disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("login");
                      resetForms();
                    }}
                    className="text-[#2A2C22] font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            )}

            {/* Forgot Password Form */}
            {activeTab === "forgot-password" && (
              <form
                onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    {...forgotPasswordForm.register("email")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
                    placeholder="you@example.com"
                  />
                  {forgotPasswordForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {forgotPasswordForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2A2C22] text-white py-3 rounded-full font-semibold hover:bg-[#1a1c12] transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("login");
                      resetForms();
                    }}
                    className="text-[#2A2C22] font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            )}

            {/* Verify OTP Form */}
            {activeTab === "verify-otp" && (
              <form onSubmit={verifyOtpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    {...verifyOtpForm.register("otp")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent text-center text-2xl tracking-widest"
                    placeholder="12345"
                    maxLength={5}
                  />
                  {verifyOtpForm.formState.errors.otp && (
                    <p className="text-red-500 text-sm mt-1">
                      {verifyOtpForm.formState.errors.otp.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2A2C22] text-white py-3 rounded-full font-semibold hover:bg-[#1a1c12] transition disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Didn&apos;t receive the code?{" "}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-[#2A2C22] font-semibold hover:underline disabled:opacity-50"
                  >
                    Resend
                  </button>
                </p>
              </form>
            )}

            {/* Reset Password Form */}
            {activeTab === "reset-password" && (
              <form
                onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showResetPassword ? "text" : "password"}
                      {...resetPasswordForm.register("newPassword")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showResetPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {resetPasswordForm.formState.errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {resetPasswordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Must contain at least 8 characters, including uppercase, lowercase, number, and
                    special character
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2A2C22] text-white py-3 rounded-full font-semibold hover:bg-[#1a1c12] transition disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
