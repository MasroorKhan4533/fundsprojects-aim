import { z } from "zod";

/*
  Validates C2 requirement data before it reaches service logic.
*/

const list = z.array(z.string());

export const leadIdSchema = z.object({
  params: z.object({
    leadId: z.string().uuid(),
  }),
});

export const c2ProfileSchema = z.object({
  params: z.object({
    leadId: z.string().uuid(),
  }),

  body: z.object({
    currentWorkflow: z.string().optional(),

    mustHaveRequirements: list.optional(),
    goodToHaveRequirements: list.optional(),
    excludedRequirements: list.optional(),
    requiredReports: list.optional(),
    integrations: list.optional(),

    demoFeedback: z.string().optional(),
    businessRequirementSummary: z.string().optional(),

    brdUrl: z.string().optional(),
    prdUrl: z.string().optional(),
    costingUrl: z.string().optional(),

    status: z.enum([
      "NOT_STARTED",
      "IN_PROGRESS",
      "WAITING_FOR_CLIENT",
      "READY_FOR_C3",
      "ON_HOLD",
    ]).optional(),
  }),
});

export const c2OutcomeSchema = z.object({
  params: z.object({
    leadId: z.string().uuid(),
  }),

  body: z.object({
    outcome: z.enum([
      "CONTINUE",
      "MOVE_TO_C3",
      "LOST",
    ]),

    lossReason: z.string().optional(),
  }),
});
