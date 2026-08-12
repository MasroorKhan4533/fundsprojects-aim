import { z } from "zod";
const optionalUrl = z.union([z.literal(""), z.string().trim().url("Enter a valid URL")]);
export const interactionFormSchema = z.object({
  stage: z.enum(["C1", "C2"]), channel: z.enum(["EMAIL", "WHATSAPP", "CALL", "ONLINE_MEETING", "OFFLINE_MEETING", "OTHER"]),
  response: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE", "NO_RESPONSE", "FOLLOW_UP_REQUIRED"]), outcome: z.enum(["STAY", "MOVE_TO_C2", "MOVE_TO_C3", "LOST"]),
  occurredAt: z.string().min(1, "Activity date/time is required"), content: z.string().max(8000).optional(), clientResponse: z.string().max(6000).optional(), agenda: z.string().max(3000).optional(), recordingUrl: optionalUrl.optional(), meetingMode: z.string().max(120).optional(), nextAction: z.string().max(1200).optional(), nextFollowUpDate: z.string().optional(),
  understanding: z.string().max(6000).optional(), requirement: z.string().max(6000).optional(), workflow: z.string().max(8000).optional(), mustHave: z.string().max(6000).optional(), goodToHave: z.string().max(6000).optional(), exclusions: z.string().max(6000).optional(), reports: z.string().max(6000).optional(), integrations: z.string().max(6000).optional(), feedback: z.string().max(6000).optional(),
  potentialStatus: z.enum(["UNCLASSIFIED", "POTENTIAL", "NON_POTENTIAL"]).optional(), qualificationStatus: z.enum(["UNQUALIFIED", "QUALIFYING", "QUALIFIED", "DISQUALIFIED"]).optional(), temperature: z.enum(["Hot", "Warm", "Potential", "Cold"]).optional(), painPoints: z.string().max(4000).optional(), businessRequirement: z.string().max(10000).optional(), decisionContext: z.string().max(6000).optional(), internalNotes: z.string().max(8000).optional(), attachmentUrl: optionalUrl.optional(),
});
