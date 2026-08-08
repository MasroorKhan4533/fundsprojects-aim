import { z } from "zod";
const empty = z.object({}).passthrough();
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
export const dashboardSchema = z.object({
  body: empty,
  params: empty,
  query: z.object({ assignedTo: objectId.optional(), dateFrom: dateOnly.optional(), dateTo: dateOnly.optional() }).refine((v) => !v.dateFrom || !v.dateTo || v.dateFrom <= v.dateTo, { message: "dateFrom cannot be after dateTo", path: ["dateFrom"] }),
});
