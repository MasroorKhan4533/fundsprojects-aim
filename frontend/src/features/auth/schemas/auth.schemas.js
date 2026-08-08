import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Enter email, mobile or user ID"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  mobile: z.string().trim().regex(/^\+[1-9]\d{7,14}$/, "Use country code, e.g. +919876543210"),
  email: z.string().trim().email("Enter a valid email address"),
  designation: z.string().trim().min(2, "Designation is required").max(120),
});

const strongPassword = z.string()
  .min(12, "Use at least 12 characters")
  .max(128)
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/\d/, "Add a number")
  .regex(/[^A-Za-z0-9]/, "Add a special character");

export const passwordSchema = z.object({ password: strongPassword, confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export const forgotPasswordSchema = z.object({ email: z.string().trim().email("Enter a valid email address") });
