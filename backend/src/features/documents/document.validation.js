import { z } from "zod";
import { DOCUMENT_CATEGORIES } from "./document.model.js";
const empty = z.object({}).passthrough();
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
export const leadDocumentParamsSchema = z.object({ body: empty, query: empty, params: z.object({ leadId: objectId }) });
export const documentParamsSchema = z.object({ body: empty, query: empty, params: z.object({ id: objectId }) });
export const uploadDocumentSchema = z.object({
  body: z.object({ category: z.enum(DOCUMENT_CATEGORIES).optional().default("GENERAL") }).passthrough(),
  query: empty,
  params: z.object({ leadId: objectId }),
});
