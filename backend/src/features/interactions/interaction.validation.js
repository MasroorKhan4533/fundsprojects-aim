import { z } from "zod";
import { INTERACTION_CHANNELS, INTERACTION_OUTCOMES, INTERACTION_RESPONSES, INTERACTION_STAGES, RESOURCE_STATUSES } from "./interaction.model.js";
import { POTENTIAL_STATUSES, QUALIFICATION_STATUSES } from "./journey-profile.model.js";

const empty = z.object({}).passthrough();
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const text = (max) => z.string().trim().max(max).optional().default("");
const optionalUrl = z.union([z.literal(""), z.string().trim().url().max(1200)]).optional().default("");
const optionalDateTime = z.union([z.literal(""), z.string().datetime({ offset: true }), z.string().datetime()]).optional().transform((value) => value === "" ? undefined : value);
const resource = z.object({ status: z.enum(RESOURCE_STATUSES).optional().default("NOT_STARTED"), url: optionalUrl }).optional().default({});

export const createInteractionSchema = z.object({
  params: empty,
  query: empty,
  body: z.object({
    leadId: objectId,
    stage: z.enum(INTERACTION_STAGES),
    channel: z.enum(INTERACTION_CHANNELS),
    occurredAt: optionalDateTime,
    response: z.enum(INTERACTION_RESPONSES).optional().default("NO_RESPONSE"),
    outcome: z.enum(INTERACTION_OUTCOMES).optional().default("STAY"),
    content: text(8000),
    clientResponse: text(6000),
    agenda: text(3000),
    recordingUrl: optionalUrl,
    meetingMode: text(120),
    nextAction: text(1200),
    nextFollowUpDate: optionalDateTime,
    presentation: resource,
    demo: resource,
    requirementDocument: resource,
    costingDocument: resource,
    versionLabel: text(120),
    attachmentUrl: optionalUrl,
    c1: z.object({ understanding: text(6000), requirement: text(6000) }).optional().default({}),
    c2: z.object({ workflow: text(8000), mustHave: text(6000), goodToHave: text(6000), exclusions: text(6000), reports: text(6000), integrations: text(6000), feedback: text(6000) }).optional().default({}),
    potentialStatus: z.enum(POTENTIAL_STATUSES).optional(),
    qualificationStatus: z.enum(QUALIFICATION_STATUSES).optional(),
    temperature: z.enum(["Hot", "Warm", "Potential", "Cold"]).optional(),
    painPoints: z.array(z.string().trim().min(1).max(220)).max(30).optional(),
    businessRequirement: text(10000),
    decisionContext: text(6000),
    internalNotes: text(8000),
  }),
});

export const listInteractionsSchema = z.object({
  body: empty,
  params: empty,
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    leadId: objectId.optional(),
    assignedTo: objectId.optional(),
    stage: z.enum(INTERACTION_STAGES).optional(),
    channel: z.enum(INTERACTION_CHANNELS).optional(),
    outcome: z.enum(INTERACTION_OUTCOMES).optional(),
    dateFrom: z.string().date().optional(),
    dateTo: z.string().date().optional(),
  }),
});

export const interactionSummarySchema = z.object({ body: empty, params: empty, query: z.object({ assignedTo: objectId.optional(), dateFrom: z.string().date().optional(), dateTo: z.string().date().optional() }) });
export const journeySchema = z.object({ body: empty, params: z.object({ leadId: objectId }), query: empty });
