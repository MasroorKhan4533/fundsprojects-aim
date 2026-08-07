import { z } from "zod";

export const leadIdSchema = z.object({
  params: z.object({
    leadId: z.string().uuid(),
  }),
});

export const profileSchema = z.object({
  params: z.object({
    leadId: z.string().uuid(),
  }),

  body: z.object({
    businessUnderstanding:
      z.string().optional(),

    initialRequirement:
      z.string().optional(),

    currentPainPoints:
      z.string().optional(),

    decisionMakersIdentified:
      z.string().optional(),

    buyingIntent:
      z.enum([
        "HIGH",
        "MEDIUM",
        "LOW",
        "UNKNOWN",
      ]).optional(),

    initialBudgetIndication:
      z.coerce
        .number()
        .nonnegative()
        .optional(),

    expectedTimeline:
      z.string().optional(),

    status:
      z.enum([
        "NOT_STARTED",
        "IN_PROGRESS",
        "WAITING_FOR_CLIENT",
        "QUALIFIED",
        "ON_HOLD",
        "LOST",
      ]).optional(),
  }),
});

export const activitySchema = z.object({
  params: z.object({
    leadId: z.string().uuid(),
  }),

  body: z.object({
    activityType: z.enum([
      "CALL",
      "EMAIL",
      "WHATSAPP",
      "LINKEDIN_MESSAGE",
      "ONLINE_MEETING",
      "OFFLINE_MEETING",
      "OTHER",
    ]),

    activityAt:
      z.string().optional(),

    contactPersonId:
      z.string().uuid().optional(),

    discussionContent:
      z.string().optional(),

    customerResponse:
      z.enum([
        "INTERESTED",
        "REPLIED",
        "MEETING_SCHEDULED",
        "FOLLOW_UP_REQUIRED",
        "NO_RESPONSE",
        "CALL_BACK_LATER",
        "NOT_INTERESTED",
        "WRONG_CONTACT",
        "REQUIREMENT_NOT_CLEAR",
        "ON_HOLD",
        "OTHER",
      ]).optional(),

    outcome:
      z.string().optional(),

    notes:
      z.string().optional(),

    callStatus:
      z.enum([
        "CONNECTED",
        "NOT_ANSWERED",
        "BUSY",
        "SWITCHED_OFF",
        "WRONG_NUMBER",
        "CALL_BACK_REQUESTED",
      ]).optional(),

    callDurationMinutes:
      z.coerce
        .number()
        .int()
        .nonnegative()
        .optional(),

    recordingUrl:
      z.string().optional(),

    meetingMode:
      z.enum([
        "ONLINE",
        "OFFLINE",
      ]).optional(),

    meetingAgenda:
      z.string().optional(),

    attendees:
      z.array(z.string()).optional(),

    meetingSummary:
      z.string().optional(),

    nextAction:
      z.string().optional(),

    meetingLink:
      z.string().optional(),

    meetingLocation:
      z.string().optional(),

    nextFollowUpAt:
      z.string().optional(),
  }),
});

export const followUpSchema = z.object({
  params: z.object({
    leadId: z.string().uuid(),
  }),

  body: z.object({
    followUpAt:
      z.string(),

    followUpType:
      z.string().min(1),

    purpose:
      z.string().optional(),

    notes:
      z.string().optional(),

    assignedUserId:
      z.string().uuid().optional(),
  }),
});

export const followUpUpdateSchema = z.object({
  params: z.object({
    leadId: z.string().uuid(),
    followUpId: z.string().uuid(),
  }),

  body: z.object({
    followUpAt:
      z.string().optional(),

    followUpType:
      z.string().optional(),

    purpose:
      z.string().optional(),

    notes:
      z.string().optional(),

    status:
      z.enum([
        "PENDING",
        "COMPLETED",
        "RESCHEDULED",
        "CANCELLED",
      ]).optional(),
  }),
});

export const outcomeSchema = z.object({
  params: z.object({
    leadId: z.string().uuid(),
  }),

  body: z.object({
    outcome: z.enum([
      "MOVE_TO_C2",
      "CONTINUE",
      "LOST",
    ]),

    lossReason:
      z.string().optional(),
  }),
});

export const reopenSchema = z.object({
  params: z.object({
    leadId: z.string().uuid(),
  }),

  body: z.object({
    reason:
      z.string().min(3),
  }),
});
