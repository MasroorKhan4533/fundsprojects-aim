import Lead from "../leads/lead.model.js";
import LeadAudit from "../leads/lead-audit.model.js";

import C4Closure from "./c4-closure.model.js";

import {
  requireLead,
  requireLeadEditAccess,
} from "../leads/lead.service.js";

/*
  C4 closure logic.
*/

export const listC4Leads = async () =>
  Lead.findAll({
    where: {
      stage: "C4",
    },
    order: [["updatedAt", "DESC"]],
  });

export const getC4 = async (leadId) => {
  const lead =
    await requireLead(leadId);

  const closure =
    await C4Closure.findOne({
      where: {
        leadId,
      },
    });

  return {
    lead,
    closure,
  };
};

export const saveClosure = async (
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
    await C4Closure.findOne({
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

  return C4Closure.create({
    leadId,
    ...payload,
    updatedById: user.id,
  });
};

export const setC4Outcome = async (
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

  const closure =
    await C4Closure.findOne({
      where: {
        leadId,
      },
    });

  if (
    !closure?.purchaseOrderNumber?.trim() ||
    !closure?.finalDealValue
  ) {
    const error =
      new Error(
        "C4 requires Purchase Order Number and Final Deal Value before marking Won"
      );

    error.status = 400;
    throw error;
  }

  const oldStage = lead.stage;

  lead.stage = "WON";
  lead.lossReason = null;

  await lead.save();

  closure.status = "WON";

  await closure.save();

  await LeadAudit.create({
    leadId,
    action: "DEAL_WON",
    fieldName: "stage",
    oldValue: oldStage,
    newValue: "WON",
    changedById: user.id,
  });

  return lead;
};
