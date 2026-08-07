import { z } from "zod";

export const targetSchema = z.object({
  body: z.object({
    userId:
      z.string().uuid(),

    targetDate:
      z.string().min(10),

    leadsTarget:
      z.coerce.number().int().nonnegative().optional(),

    callsTarget:
      z.coerce.number().int().nonnegative().optional(),

    meetingsTarget:
      z.coerce.number().int().nonnegative().optional(),

    followUpsTarget:
      z.coerce.number().int().nonnegative().optional(),

    proposalsTarget:
      z.coerce.number().int().nonnegative().optional(),

    closuresTarget:
      z.coerce.number().int().nonnegative().optional(),

    notes:
      z.string().optional(),
  }),
});

export const targetIdSchema = z.object({
  params: z.object({
    id:
      z.string().uuid(),
  }),
});
