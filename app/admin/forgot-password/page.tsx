"use client";

import {
  Key01Icon,
  Mail01Icon,
  SquareLock02Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  ForgotPasswordFormData,
  VerifyOtpFormData,
  ResetPasswordFormData,
} from "../../schemas/authSchema";
import authService from "../../services/authService";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Step = "email" | "verify-otp" | "reset-password";

export default function AdminForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState<string>("");
  const [resetToken, setResetToken] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const router = useRouter();

  // Email form
  const emailForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Verify OTP form
  const otpForm = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
  });

  // Reset password form
  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleEmailSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError("");
    try {
      const response = await authService.forgotPassword(data);
      if (response.success && response.tempToken) {
        setTempToken(response.tempToken);
        setUserEmail(data.email);
        setSuccess(response.message);
        setTimeout(() => {
          setCurrentStep("verify-otp");
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

  const handleOtpSubmit = async (data: VerifyOtpFormData) => {
    setLoading(true);
    setError("");
    try {
      const response = await authService.verifyOtp(data, tempToken);
      if (response.success && response.resetToken) {
        setResetToken(response.resetToken);
        setSuccess(response.message);
        setTimeout(() => {
          setCurrentStep("reset-password");
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

  const handleResetSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);
    setError("");
    try {
      const response = await authService.resetPassword(data, resetToken);
      if (response.success) {
        setSuccess(response.message);
        setTimeout(() => {
          router.push("/admin/login");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf9f5] to-[#b9aca2]">
      <div className="w-full max-w-md p-8">
        <div className="bg-[#faf9f5] rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#5d6043] rounded-full mb-4">
              {currentStep === "email" && <AdminIcon icon={Mail01Icon} size={32} className="text-[#faf9f5]" />}
              {currentStep === "verify-otp" && <AdminIcon icon={Key01Icon} size={32} className="text-[#faf9f5]" />}
              {currentStep === "reset-password" && <AdminIcon icon={SquareLock02Icon} size={32} className="text-[#faf9f5]" />}
            </div>
            <h1 className="text-3xl font-bold text-[#222222] mb-2">
              {currentStep === "email" && "Reset Password"}
              {currentStep === "verify-otp" && "Verify OTP"}
              {currentStep === "reset-password" && "New Password"}
            </h1>
            <p className="text-[#5d6043]">
              {currentStep === "email" && "We'll send you a code to reset your password"}
              {currentStep === "verify-otp" && "Enter the 5-digit code sent to your email"}
              {currentStep === "reset-password" && "Create a new secure password"}
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

          {/* Email Step */}
          {currentStep === "email" && (
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#5d6043] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AdminIcon icon={Mail01Icon} size={20} className="text-[#b9aca2]" />
                  </div>
                  <input
                    type="email"
                    {...emailForm.register("email")}
                    className="w-full pl-10 pr-4 py-3 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
                    placeholder="admin@cozyoven.com"
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5d6043] text-[#faf9f5] py-3 rounded-full font-semibold hover:bg-[#222222] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {/* Verify OTP Step */}
          {currentStep === "verify-otp" && (
            <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#5d6043] mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  {...otpForm.register("otp")}
                  className="w-full px-4 py-3 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="12345"
                  maxLength={5}
                />
                {otpForm.formState.errors.otp && (
                  <p className="text-red-500 text-sm mt-1">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5d6043] text-[#faf9f5] py-3 rounded-full font-semibold hover:bg-[#222222] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <p className="text-center text-sm text-[#5d6043]">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-[#5d6043] font-semibold hover:underline disabled:opacity-50"
                >
                  Resend
                </button>
              </p>
            </form>
          )}

          {/* Reset Password Step */}
          {currentStep === "reset-password" && (
            <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#5d6043] mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AdminIcon icon={SquareLock02Icon} size={20} className="text-[#b9aca2]" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    {...resetForm.register("newPassword")}
                    className="w-full pl-10 pr-12 py-3 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <AdminIcon icon={ViewOffSlashIcon} size={20} className="text-[#b9aca2] hover:text-[#5d6043]" />
                    ) : (
                      <AdminIcon icon={ViewIcon} size={20} className="text-[#b9aca2] hover:text-[#5d6043]" />
                    )}
                  </button>
                </div>
                {resetForm.formState.errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {resetForm.formState.errors.newPassword.message}
                  </p>
                )}
                <p className="text-xs text-[#5d6043] mt-1">
                  Must contain at least 8 characters, including uppercase, lowercase, number, and
                  special character
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5d6043] text-[#faf9f5] py-3 rounded-full font-semibold hover:bg-[#222222] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <Link
              href="/admin/login"
              className="text-sm text-[#5d6043] hover:underline font-medium"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
