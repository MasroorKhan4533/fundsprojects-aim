import { z } from "zod";

const leadSources = [
  "LINKEDIN",
  "REFERRAL",
  "WEBSITE",
  "COLD_CALL",
  "EVENT",
  "APOLLO",
  "GOOGLE",
  "UPWORK",
  "FIVERR",
  "ADVERTISEMENT",
  "EXISTING_DATABASE",
  "PARTNER",
  "OTHER",
];

const contactTypes = [
  "DECISION_MAKER",
  "INFLUENCER",
  "TECHNICAL",
  "FINANCE",
  "OPERATIONS",
  "PURCHASE",
  "OTHER",
];

const optionalUrl = z
  .union([z.string().url(), z.literal("")])
  .optional();

const optionalEmail = z
  .union([z.string().email(), z.literal("")])
  .optional();

const contactSchema = z.object({
  fullName: z.string().min(2).max(150),
  designation: z.string().max(150).optional(),
  email: optionalEmail,
  mobile: z.string().max(30).optional(),
  whatsapp: z.string().max(30).optional(),
  contactType: z.enum(contactTypes).optional(),
  isPrimary: z.boolean().optional(),
});

export const createLeadSchema = z.object({
  body: z.object({
    companyName: z.string().min(2).max(200),
    website: optionalUrl,
    linkedinUrl: optionalUrl,

    sector: z.string().min(2).max(150),
    subSector: z.string().max(150).optional(),

    businessTypes: z.array(z.string().max(100)).optional(),

    companySize: z.string().max(100).optional(),

    employeeStrength: z.coerce
      .number()
      .int()
      .nonnegative()
      .optional(),

    annualTurnover: z.coerce
      .number()
      .nonnegative()
      .optional(),

    country: z.string().min(2).max(100),
    state: z.string().max(100).optional(),
    city: z.string().max(100).optional(),

    leadSource: z.enum(leadSources),

    otherSourceDescription: z
      .string()
      .max(255)
      .optional(),

    estimatedProjectBudget: z.coerce
      .number()
      .nonnegative()
      .optional(),

    companyOverview: z.string().optional(),
    painPoints: z.string().optional(),
    researchNotes: z.string().optional(),

    assignedOwnerId: z.string().uuid().optional(),

    primaryContact: contactSchema,

    additionalContacts: z
      .array(contactSchema)
      .optional(),
  }),
});

export const updateLeadSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),

  body: z.object({
    companyName: z.string().min(2).max(200).optional(),
    website: optionalUrl,
    linkedinUrl: optionalUrl,

    sector: z.string().min(2).max(150).optional(),
    subSector: z.string().max(150).optional(),

    businessTypes: z.array(z.string().max(100)).optional(),

    companySize: z.string().max(100).optional(),

    employeeStrength: z.coerce
      .number()
      .int()
      .nonnegative()
      .optional(),

    annualTurnover: z.coerce
      .number()
      .nonnegative()
      .optional(),

    country: z.string().min(2).max(100).optional(),
    state: z.string().max(100).optional(),
    city: z.string().max(100).optional(),

    leadSource: z.enum(leadSources).optional(),

    otherSourceDescription: z
      .string()
      .max(255)
      .optional(),

    verificationStatus: z
      .enum(["PENDING", "VALID", "INVALID"])
      .optional(),

    invalidReason: z.string().optional(),

    potentialStatus: z
      .enum(["UNSURE", "POTENTIAL", "NON_POTENTIAL"])
      .optional(),

    temperature: z
      .enum(["HOT", "WARM", "COLD"])
      .optional(),

    estimatedProjectBudget: z.coerce
      .number()
      .nonnegative()
      .optional(),

    companyOverview: z.string().optional(),
    painPoints: z.string().optional(),
    researchNotes: z.string().optional(),
  }),
});

export const duplicateCheckSchema = z.object({
  body: z.object({
    companyName: z.string().optional(),
    website: z.string().optional(),
    email: z.string().optional(),
    mobile: z.string().optional(),
  }),
});

export const leadIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const assignLeadSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),

  body: z.object({
    assignedOwnerId: z.string().uuid(),
  }),
});

export const addContactSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),

  body: contactSchema,
});

export const updateContactSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    contactId: z.string().uuid(),
  }),

  body: contactSchema.partial(),
});

export const contactIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    contactId: z.string().uuid(),
  }),
});

export const commentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),

  body: z.object({
    comment: z.string().min(1),
    stageContext: z
      .enum(["A", "C1", "C2", "C3", "C4"])
      .optional(),
  }),
});

export const listLeadSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),

    search: z.string().optional(),

    assignedOwnerId: z.string().uuid().optional(),

    stage: z
      .enum(["C1", "C2", "C3", "C4", "WON", "LOST"])
      .optional(),

    temperature: z
      .enum(["HOT", "WARM", "COLD"])
      .optional(),

    verificationStatus: z
      .enum(["PENDING", "VALID", "INVALID"])
      .optional(),

    potentialStatus: z
      .enum(["UNSURE", "POTENTIAL", "NON_POTENTIAL"])
      .optional(),

    sector: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),

    leadSource: z.enum(leadSources).optional(),

    createdFrom: z.string().optional(),
    createdTo: z.string().optional(),

    minBudget: z.coerce.number().nonnegative().optional(),
    maxBudget: z.coerce.number().nonnegative().optional(),
  }),
});
