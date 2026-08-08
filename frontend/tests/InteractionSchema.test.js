import { describe, expect, it } from "vitest";
import { interactionFormSchema } from "../src/features/interactions/schemas/interaction.schemas";

describe("C1/C2 interaction form schema", () => {
  it("accepts a production C1 interaction payload", () => {
    const result = interactionFormSchema.safeParse({ stage: "C1", channel: "EMAIL", response: "POSITIVE", outcome: "MOVE_TO_C2", occurredAt: "2026-08-08T20:00", content: "Intro", clientResponse: "Interested", agenda: "", recordingUrl: "", meetingMode: "", nextAction: "Discovery", nextFollowUpDate: "", understanding: "Manual flow", requirement: "ERP", workflow: "", mustHave: "", goodToHave: "", exclusions: "", reports: "", integrations: "", feedback: "", potentialStatus: "UNCLASSIFIED", qualificationStatus: "UNQUALIFIED", temperature: "Warm", painPoints: "", businessRequirement: "", decisionContext: "", internalNotes: "", attachmentUrl: "" });
    expect(result.success).toBe(true);
  });
});
