import { z } from "zod";

const apiUrl = z.string().min(1).refine((value) => {
  if (value.startsWith("/")) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}, "VITE_API_URL must be an absolute URL or a root-relative path");

const schema = z.object({ VITE_API_URL: apiUrl });

const parsed = schema.safeParse({
  VITE_API_URL: import.meta.env.VITE_API_URL || "/api/v1",
});

if (!parsed.success) {
  throw new Error(`Invalid frontend environment: ${parsed.error.issues.map((issue) => issue.message).join(", ")}`);
}

export const env = Object.freeze({
  apiUrl: parsed.data.VITE_API_URL.replace(/\/$/, ""),
});
