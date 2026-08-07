import { z } from "zod";

const uuidParam = z.object({
  id: z.string().uuid(),
});

export const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(150),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["ADMIN", "TEAM_MEMBER"]),
  }),
});

export const statusSchema = z.object({
  params: uuidParam,

  body: z.object({
    status: z.enum(["ACTIVE", "DISABLED"]),
  }),
});

export const roleSchema = z.object({
  params: uuidParam,

  body: z.object({
    role: z.enum(["ADMIN", "TEAM_MEMBER"]),
  }),
});

export const passwordSchema = z.object({
  params: uuidParam,

  body: z.object({
    password: z.string().min(8),
  }),
});
