import { z } from "zod";
import { DEAL_STATUSES, FINAL_VERSION_LABELS, PAYMENT_STATUSES, PROPOSAL_STATUSES, VERSION_LABELS } from "./deal.model.js";

const empty = z.object({}).passthrough();
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const text = (max) => z.string().trim().max(max).optional().default("");
const optionalUrl = z.union([z.literal(""), z.string().trim().url().max(1200)]).optional().default("");
const optionalDate = z.union([z.literal(""), z.string().datetime({ offset: true }), z.string().datetime(), z.string().date()]).optional().transform((value) => value === "" ? undefined : value);
const version = z.object({ label: z.enum(VERSION_LABELS), modules: text(12000), timeline: text(1200), cost: z.coerce.number().min(0).optional().default(0) });

export const c3Schema = z.object({
  params: z.object({ leadId: objectId }), query: empty,
  body: z.object({
    budget: z.coerce.number().min(0).optional().default(0),
    probability: z.coerce.number().min(0).max(100).optional().default(0),
    expectedClose: optionalDate,
    versions: z.array(version).max(3).optional().default([]),
    preferredVersion: z.enum(["", ...FINAL_VERSION_LABELS]).optional().default(""),
    proposalVersion: z.enum(["", ...FINAL_VERSION_LABELS]).optional().default(""),
    proposalStatus: z.enum(PROPOSAL_STATUSES).optional().default("PENDING"),
    proposalUrl: optionalUrl, quotationUrl: optionalUrl, negotiationNotes: text(10000),
  }),
});

export const c4Schema = z.object({
  params: z.object({ leadId: objectId }), query: empty,
  body: z.object({
    finalVersion: z.enum(["", ...FINAL_VERSION_LABELS]).optional().default(""),
    finalValue: z.coerce.number().min(0).optional().default(0),
    discountPercent: z.coerce.number().min(0).max(100).optional().default(0),
    advanceAmount: z.coerce.number().min(0).optional().default(0),
    paymentStatus: z.enum(PAYMENT_STATUSES).optional().default("PENDING"),
    dealStatus: z.enum(DEAL_STATUSES).optional().default("ACTIVE"),
    finalScope: text(14000), paymentTerms: text(8000), agreementUrl: optionalUrl, ndaUrl: optionalUrl, poUrl: optionalUrl,
    agreementFileName: text(500), customCommissionPercent: z.coerce.number().min(0).max(100).optional().default(0),
    payoutStart: optionalDate, payoutMonths: z.coerce.number().int().min(0).max(120).optional().default(0), approvedTimeline: text(2000), closureNotes: text(10000),
  }),
});

export const listDealsSchema = z.object({ body: empty, params: empty, query: z.object({
  page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(25),
  assignedTo: objectId.optional(), search: z.string().trim().max(200).optional().default(""),
  dealStatus: z.enum(DEAL_STATUSES).optional(), stage: z.enum(["C3", "C4"]).optional(), proposalStatus: z.enum(PROPOSAL_STATUSES).optional(),
}) });
export const summarySchema = z.object({ body: empty, params: empty, query: z.object({ assignedTo: objectId.optional() }) });
export const leadDealSchema = z.object({ body: empty, params: z.object({ leadId: objectId }), query: empty });
export const handoverSchema = z.object({ body: empty, params: z.object({ leadId: objectId }), query: empty });
