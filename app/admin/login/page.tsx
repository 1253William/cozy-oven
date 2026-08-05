"use client";

import {
  Mail01Icon,
  SquareLock02Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../components/AdminIcon";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "../../schemas/authSchema";
import authService from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import Image from "next/image";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError("");
    try {
      const response = await authService.login(data);
      if (response.success && response.data) {
        if (response.data.role !== "Admin") {
          setError("Access denied. Admin credentials required.");
          await authService.logout();
          setLoading(false);
          return;
        }
        await login(response.data);
        router.push("/admin/dashboard");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Login failed. Please try again.");
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
            <div className="inline-flex items-center justify-center">
              <Image src="/cozy3.png" alt="Cozy Oven Logo" width={80} height={50} />
            </div>
            <p className="text-[#5d6043]">Sign in to access your dashboard</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
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
                  {...register("email")}
                  className="w-full pl-10 pr-4 py-3 border border-[#b9aca2] rounded-lg focus:ring-2 focus:ring-[#5d6043] focus:border-transparent"
                  placeholder="admin@cozyoven.store"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-[#5d6043] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AdminIcon icon={SquareLock02Icon} size={20} className="text-[#b9aca2]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
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
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-between">
              <Link
                href="/admin/forgot-password"
                className="text-sm text-[#5d6043] hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5d6043] text-[#faf9f5] py-3 rounded-full font-semibold hover:bg-[#222222] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
