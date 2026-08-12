import { z } from "zod";
import { COMPANY_SIZES, FOLLOW_UP_STATUSES, LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STAGES, LEAD_TEMPERATURES } from "./lead.model.js";

const empty = z.object({}).passthrough();
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const text = (max) => z.string().trim().max(max).optional();
const optionalUrl = z.union([z.literal(""), z.string().trim().url().max(1200)]).optional();
const optionalEmail = z.union([z.literal(""), z.string().trim().email().max(254)]).optional();
const optionalDateTime = z.union([z.literal(""), z.string().datetime({ offset: true }), z.string().datetime()]).optional().transform((value) => value === "" ? undefined : value);

const contact = z.object({
  fullName: z.string().trim().min(1).max(160),
  designation: text(160).default(""),
  email: optionalEmail.default(""),
  mobile: text(32).default(""),
  whatsapp: text(32).default(""),
  linkedinProfileUrl: optionalUrl.default(""),
  isPrimary: z.boolean().optional().default(false),
});

const followUp = z.object({
  sequence: z.coerce.number().int().min(1).max(3),
  scheduledAt: optionalDateTime,
  status: z.enum(FOLLOW_UP_STATUSES).default("Pending"),
  note: text(1000).default(""),
});

const common = {
  companyName: z.string().trim().min(2).max(220),
  primaryContact: z.object({
    fullName: z.string().trim().min(1).max(160),
    designation: text(160).default(""),
    email: optionalEmail.default(""),
    mobile: text(32).default(""),
    whatsapp: text(32).default(""),
    linkedinProfileUrl: optionalUrl.default(""),
  }),
  contacts: z.array(contact).max(12).optional().default([]),
  industry: z.string().trim().min(2).max(160),
  subSector: text(160).default(""),
  businessModels: z.array(z.string().trim().min(1).max(120)).max(12).optional().default([]),
  companySize: z.union([z.literal(""), z.enum(COMPANY_SIZES)]).optional().default(""),
  employeeStrength: text(80).default(""),
  annualTurnover: z.coerce.number().finite().min(0).optional().default(0),
  estimatedBudget: z.coerce.number().finite().min(0).optional().default(0),
  country: text(120).default("India"),
  state: text(120).default(""),
  city: text(120).default(""),
  websiteUrl: optionalUrl.default(""),
  linkedinPostUrl: optionalUrl.default(""),
  postDate: optionalDateTime,
  postContent: text(6000).default(""),
  businessRequirementAnalysis: text(6000).default(""),
  buyingIntentScore: z.coerce.number().int().min(0).max(100).optional().default(0),
  leadPriority: z.enum(LEAD_PRIORITIES).optional().default("Medium"),
  personalizedComment: text(3000).default(""),
  firstMessage: text(4000).default(""),
  followUps: z.array(followUp).max(3).optional().default([]),
  salesStage: z.enum(LEAD_STAGES).optional().default("C1"),
  assignedTo: objectId.optional(),
  source: z.enum(LEAD_SOURCES).optional().default("LinkedIn"),
  temperature: z.enum(LEAD_TEMPERATURES).optional().default("Warm"),
  decisionMakers: text(3000).default(""),
  companyOverview: text(6000).default(""),
  painPoints: z.array(z.string().trim().min(1).max(220)).max(30).optional().default([]),
  internalComments: text(6000).default(""),
  nextAction: text(1200).default(""),
  nextFollowUpDate: optionalDateTime,
  attachmentUrl: optionalUrl.default(""),
  researchNotes: text(6000).default(""),
};

const createBody = z.object(common);
const updateBody = z.object(Object.fromEntries(Object.entries(common).map(([key, schema]) => [key, schema.optional()]))).refine((value) => Object.keys(value).length > 0, { message: "At least one field is required" });

export const listLeadsSchema = z.object({
  body: empty,
  params: empty,
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    search: z.string().trim().max(160).optional().default(""),
    assignedTo: objectId.optional(),
    salesStage: z.enum(LEAD_STAGES).optional(),
    leadPriority: z.enum(LEAD_PRIORITIES).optional(),
    temperature: z.enum(LEAD_TEMPERATURES).optional(),
    source: z.enum(LEAD_SOURCES).optional(),
    industry: z.string().trim().max(160).optional(),
    city: z.string().trim().max(120).optional(),
    country: z.string().trim().max(120).optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "companyName", "estimatedBudget", "buyingIntentScore", "nextFollowUpDate"]).default("updatedAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    includeDeleted: z.enum(["true", "false"]).optional().default("false"),
  }),
});

export const createLeadSchema = z.object({ body: createBody, params: empty, query: empty });
export const updateLeadSchema = z.object({ body: updateBody, params: z.object({ id: objectId }), query: empty });
export const leadIdSchema = z.object({ body: empty, params: z.object({ id: objectId }), query: empty });
export const leadSummarySchema = z.object({ body: empty, params: empty, query: z.object({ assignedTo: objectId.optional() }) });
