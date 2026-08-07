import Lead from "../leads/lead.model.js";
import LeadAudit from "../leads/lead-audit.model.js";
import C2Profile from "./c2-profile.model.js";

import {
  requireLead,
  requireLeadEditAccess,
} from "../leads/lead.service.js";

/*
  C2 business logic.
*/

export const listC2Leads = async () =>
  Lead.findAll({
    where: {
      stage: "C2",
    },
    order: [["updatedAt", "DESC"]],
  });

export const getC2 = async (leadId) => {
  const lead = await requireLead(leadId);

  const profile =
    await C2Profile.findOne({
      where: {
        leadId,
      },
    });

  return {
    lead,
    profile,
  };
};

export const saveC2 = async (
  leadId,
  payload,
  user
) => {
  const lead =
    await requireLead(leadId);

  requireLeadEditAccess(
    lead,
    user
  );

  const existing =
    await C2Profile.findOne({
      where: {
        leadId,
      },
    });

  if (existing) {
    await existing.update({
      ...payload,
      updatedById: user.id,
    });

    return existing;
  }

  return C2Profile.create({
    leadId,
    ...payload,
    updatedById: user.id,
  });
};

export const setC2Outcome = async (
  leadId,
  payload,
  user
) => {
  const lead =
    await requireLead(leadId);

  requireLeadEditAccess(
    lead,
    user
  );

  if (payload.outcome === "CONTINUE") {
    return lead;
  }

  if (payload.outcome === "LOST") {
    if (!payload.lossReason?.trim()) {
      const error =
        new Error(
          "Loss reason is required"
        );

      error.status = 400;
      throw error;
    }

    const oldStage = lead.stage;

    lead.stage = "LOST";
    lead.lossReason =
      payload.lossReason;

    await lead.save();

    await LeadAudit.create({
      leadId,
      action: "STAGE_CHANGED",
      fieldName: "stage",
      oldValue: oldStage,
      newValue: "LOST",
      changedById: user.id,
    });

    return lead;
  }

  const profile =
    await C2Profile.findOne({
      where: {
        leadId,
      },
    });

  if (
    !profile?.currentWorkflow?.trim() ||
    !profile?.mustHaveRequirements?.length
  ) {
    const error =
      new Error(
        "C2 requires Current Workflow and at least one Must-Have Requirement"
      );

    error.status = 400;
    throw error;
  }

  const oldStage = lead.stage;

  lead.stage = "C3";
  await lead.save();

  profile.status = "READY_FOR_C3";
  await profile.save();

  await LeadAudit.create({
    leadId,
    action: "STAGE_CHANGED",
    fieldName: "stage",
    oldValue: oldStage,
    newValue: "C3",
    changedById: user.id,
  });

  return lead;
};
