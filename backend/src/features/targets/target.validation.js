import { z } from "zod";
import { TARGET_FOCUS_STAGES } from "./target.model.js";

const empty = z.object({}).passthrough();
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const nonNegative = z.coerce.number().finite().min(0).default(0);

const metrics = z.object({
  leads: nonNegative,
  emails: nonNegative,
  messages: nonNegative,
  calls: nonNegative,
  meetings: nonNegative,
  c1: nonNegative,
  c2: nonNegative,
  c3: nonNegative,
  c4: nonNegative,
  proposals: nonNegative,
  revenue: nonNegative,
});

const targetBody = z.object({
  targetDate: dateOnly,
  assignedTo: objectId,
  focusStage: z.enum(TARGET_FOCUS_STAGES).default("Overall"),
  metrics,
  notes: z.string().trim().max(1500).optional().default(""),
});

export const listTargetsSchema = z.object({
  body: empty,
  params: empty,
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    assignedTo: objectId.optional(),
    focusStage: z.enum(TARGET_FOCUS_STAGES).optional(),
    dateFrom: dateOnly.optional(),
    dateTo: dateOnly.optional(),
  }).refine((value) => !value.dateFrom || !value.dateTo || value.dateFrom <= value.dateTo, {
    message: "dateFrom cannot be after dateTo",
    path: ["dateFrom"],
  }),
});

export const createTargetSchema = z.object({ body: targetBody, params: empty, query: empty });
export const updateTargetSchema = z.object({ body: targetBody, params: z.object({ id: objectId }), query: empty });
export const targetIdSchema = z.object({ body: empty, params: z.object({ id: objectId }), query: empty });
