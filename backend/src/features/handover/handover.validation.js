import { z } from "zod";

export const leadSchema = z.object({
  params: z.object({
    leadId:
      z.string().uuid(),
  }),
});

export const updateSchema = z.object({
  params: z.object({
    id:
      z.string().uuid(),
  }),

  body: z.object({
    projectName:
      z.string().optional(),

    finalScopeSummary:
      z.string().optional(),

    commercialSummary:
      z.string().optional(),

    keyRequirements:
      z.array(
        z.string()
      ).optional(),

    importantDependencies:
      z.array(
        z.string()
      ).optional(),

    referenceUrls:
      z.array(
        z.string()
      ).optional(),

    internalNotes:
      z.string().optional(),

    handoverStatus:
      z.enum([
        "DRAFT",
        "READY",
        "HANDED_OVER",
      ]).optional(),
  }),
});
