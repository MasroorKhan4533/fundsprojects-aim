import { z } from "zod";

/*
  Validates C3 solution and commercial data.
*/

export const leadIdSchema = z.object({
  params: z.object({
    leadId: z.string().uuid(),
  }),
});

export const solutionSchema = z.object({
  params: z.object({
    leadId: z.string().uuid(),
  }),

  body: z.object({
    versionNumber:
      z.coerce.number().int().min(1).max(99),

    solutionSummary:
      z.string().optional(),

    modules:
      z.array(z.string()).optional(),

    scopeNotes:
      z.string().optional(),

    clientFeedback:
      z.string().optional(),

    demoUrl:
      z.string().optional(),

    presentationUrl:
      z.string().optional(),

    status:
      z.enum([
        "DRAFT",
        "SHARED",
        "REVISED",
        "APPROVED",
        "REJECTED",
      ]).optional(),
  }),
});

export const commercialSchema = z.object({
  params: z.object({
    leadId: z.string().uuid(),
  }),

  body: z.object({
    proposalUrl:
      z.string().optional(),

    quotationUrl:
      z.string().optional(),

    quotationNumber:
      z.string().optional(),

    proposalAmount:
      z.coerce.number().nonnegative().optional(),

    quotationAmount:
      z.coerce.number().nonnegative().optional(),

    currency:
      z.string().optional(),

    probabilityPercent:
      z.coerce.number().int().min(0).max(100).optional(),

    negotiationNotes:
      z.string().optional(),

    commercialStatus:
      z.enum([
        "DRAFT",
        "PROPOSAL_SENT",
        "QUOTATION_SENT",
        "NEGOTIATION",
        "COMMERCIAL_AGREED",
      ]).optional(),
  }),
});

export const c3OutcomeSchema = z.object({
  params: z.object({
    leadId: z.string().uuid(),
  }),

  body: z.object({
    outcome: z.enum([
      "CONTINUE",
      "MOVE_TO_C4",
      "LOST",
    ]),

    lossReason:
      z.string().optional(),
  }),
});
