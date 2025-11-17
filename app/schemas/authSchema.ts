import { z } from "zod";

// Signup Schema
export const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["Customer", "Admin"]),
});

export type SignupFormData = z.infer<typeof signupSchema>;

// Login Schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Verify OTP Schema
export const verifyOtpSchema = z.object({
  otp: z.string().length(5, "OTP must be 5 digits").regex(/^\d+$/, "OTP must contain only numbers"),
});

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

// Reset Password Schema
export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

