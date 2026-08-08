import { z } from "zod";

const schema = z.object({
  VITE_API_URL: z.string().url(),
});

const parsed = schema.safeParse({
  VITE_API_URL: import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1",
});

if (!parsed.success) {
  throw new Error(`Invalid frontend environment: ${parsed.error.issues.map((issue) => issue.message).join(", ")}`);
}

export const env = Object.freeze({
  apiUrl: parsed.data.VITE_API_URL.replace(/\/$/, ""),
});
