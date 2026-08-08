import { z } from "zod";

const empty = z.object({}).passthrough();
const e164Mobile = z.string().trim().regex(/^\+[1-9]\d{7,14}$/, "Use mobile number with country code, e.g. +919876543210");
const password = z.string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password is too long")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/\d/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(120),
    mobile: e164Mobile,
    email: z.string().trim().email().max(254),
    designation: z.string().trim().min(2).max(120),
  }),
  params: empty,
  query: empty,
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().trim().min(3).max(254),
    password: z.string().min(1).max(128),
    rememberMe: z.boolean().optional().default(false),
  }),
  params: empty,
  query: empty,
});

export const activationSchema = z.object({
  body: z.object({
    token: z.string().min(32).max(500),
    password,
  }),
  params: empty,
  query: empty,
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email: z.string().trim().email().max(254) }),
  params: empty,
  query: empty,
});

export const resetPasswordSchema = z.object({
  body: z.object({ token: z.string().min(32).max(500), password }),
  params: empty,
  query: empty,
});

export const refreshSchema = z.object({ body: empty, params: empty, query: empty });
export const logoutSchema = refreshSchema;
