import { z } from "zod";

/*
  Validates final commercial closure information.
*/

export const leadIdSchema = z.object({
  params: z.object({
    leadId: z.string().uuid(),
  }),
});

export const closureSchema = z.object({
  params: z.object({
    leadId: z.string().uuid(),
  }),

  body: z.object({
    agreementUrl:
      z.string().optional(),

    ndaUrl:
      z.string().optional(),

    purchaseOrderUrl:
      z.string().optional(),

    purchaseOrderNumber:
      z.string().optional(),

    finalDealValue:
      z.coerce.number().nonnegative().optional(),

    advanceAmount:
      z.coerce.number().nonnegative().optional(),

    paymentStatus:
      z.enum([
        "NOT_STARTED",
        "ADVANCE_PENDING",
        "ADVANCE_RECEIVED",
        "PARTIALLY_PAID",
        "PAID",
      ]).optional(),

    closureNotes:
      z.string().optional(),

    status:
      z.enum([
        "NEGOTIATING",
        "DOCUMENTATION",
        "READY_TO_CLOSE",
        "WON",
        "LOST",
      ]).optional(),
  }),
});

export const c4OutcomeSchema = z.object({
  params: z.object({
    leadId: z.string().uuid(),
  }),

  body: z.object({
    outcome: z.enum([
      "CONTINUE",
      "WON",
      "LOST",
    ]),

    lossReason:
      z.string().optional(),
  }),
});
