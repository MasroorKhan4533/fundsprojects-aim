import Lead from "../leads/lead.model.js";
import LeadAudit from "../leads/lead-audit.model.js";

import SolutionVersion from "./solution-version.model.js";
import CommercialProfile from "./commercial-profile.model.js";

import {
  requireLead,
  requireLeadEditAccess,
} from "../leads/lead.service.js";

/*
  C3 solution + commercial logic.
*/

export const listC3Leads = async () =>
  Lead.findAll({
    where: {
      stage: "C3",
    },
    order: [["updatedAt", "DESC"]],
  });

export const getC3 = async (leadId) => {
  const lead =
    await requireLead(leadId);

  const solutions =
    await SolutionVersion.findAll({
      where: {
        leadId,
      },
      order: [["versionNumber", "ASC"]],
    });

  const commercial =
    await CommercialProfile.findOne({
      where: {
        leadId,
      },
    });

  return {
    lead,
    solutions,
    commercial,
  };
};

export const saveSolution = async (
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

  const versionLabel =
    `V${payload.versionNumber}`;

  const existing =
    await SolutionVersion.findOne({
      where: {
        leadId,
        versionNumber:
          payload.versionNumber,
      },
    });

  if (existing) {
    await existing.update({
      ...payload,
      versionLabel,
    });

    return existing;
  }

  return SolutionVersion.create({
    leadId,
    ...payload,
    versionLabel,
    createdById: user.id,
  });
};

export const saveCommercial = async (
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
    await CommercialProfile.findOne({
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

  return CommercialProfile.create({
    leadId,
    ...payload,
    updatedById: user.id,
  });
};

export const setC3Outcome = async (
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

  const solutionCount =
    await SolutionVersion.count({
      where: {
        leadId,
      },
    });

  const commercial =
    await CommercialProfile.findOne({
      where: {
        leadId,
      },
    });

  if (
    solutionCount < 1 ||
    !commercial?.proposalAmount
  ) {
    const error =
      new Error(
        "C3 requires at least one Solution Version and Proposal Amount"
      );

    error.status = 400;
    throw error;
  }

  const oldStage = lead.stage;

  lead.stage = "C4";
  await lead.save();

  await LeadAudit.create({
    leadId,
    action: "STAGE_CHANGED",
    fieldName: "stage",
    oldValue: oldStage,
    newValue: "C4",
    changedById: user.id,
  });

  return lead;
};
