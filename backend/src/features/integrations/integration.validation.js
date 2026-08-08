import { z } from "zod";
const empty = z.object({}).passthrough();
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
export const launchSchema = z.object({ body: z.object({ channel: z.enum(["EMAIL", "WHATSAPP", "CALL"]), subject: z.string().trim().max(300).optional().default(""), message: z.string().trim().max(4000).optional().default("") }), params: z.object({ leadId: objectId }), query: empty });
