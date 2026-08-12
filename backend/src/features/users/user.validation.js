import { z } from "zod";
import { USER_ROLES, USER_STATUSES } from "../auth/auth.constants.js";

const empty = z.object({}).passthrough();
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid user id");

export const listUsersSchema = z.object({
  body: empty,
  params: empty,
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    status: z.enum(USER_STATUSES).optional(),
    role: z.enum(USER_ROLES).optional(),
    search: z.string().trim().max(120).optional().default(""),
  }),
});

export const approvalSchema = z.object({
  body: z.discriminatedUnion("decision", [
    z.object({ decision: z.literal("APPROVE"), role: z.enum(USER_ROLES).default("TEAM_MEMBER") }),
    z.object({ decision: z.literal("REJECT"), reason: z.string().trim().min(2).max(500) }),
  ]),
  params: z.object({ id: objectId }),
  query: empty,
});

export const roleSchema = z.object({
  body: z.object({ role: z.enum(USER_ROLES) }),
  params: z.object({ id: objectId }),
  query: empty,
});

export const statusSchema = z.object({
  body: z.object({ status: z.enum(["ACTIVE", "DISABLED"]) }),
  params: z.object({ id: objectId }),
  query: empty,
});

export const userIdParamSchema = z.object({
  body: empty,
  params: z.object({ id: objectId }),
  query: empty,
});
