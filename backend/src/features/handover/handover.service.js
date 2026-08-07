import { sequelize } from "../../config/database.js";

import Lead from "../leads/lead.model.js";
import C2Profile from "../c2/c2-profile.model.js";
import CommercialProfile from "../c3/commercial-profile.model.js";
import C4Closure from "../c4/c4-closure.model.js";

import BuildHandover from "./build-handover.model.js";

/*
  Generates an internal handover from an already WON deal.
*/

const nextCode =
  async () => {
    const [rows] =
      await sequelize.query(`
        SELECT nextval('handover_business_id_seq') AS value
      `);

    const value =
      Number(
        rows[0].value
      );

    const date =
      new Date()
        .toISOString()
        .slice(0, 10)
        .replaceAll(
          "-",
          ""
        );

    return `AIM-HO-${date}-${String(
      value
    ).padStart(
      4,
      "0"
    )}`;
  };

export const listHandovers =
  async () =>
    BuildHandover.findAll({
      include: [
        {
          model:
            Lead,

          as:
            "lead",
        },
      ],

      order: [
        [
          "createdAt",
          "DESC",
        ],
      ],
    });

export const createHandover =
  async (
    leadId,
    currentUser
  ) => {
    const lead =
      await Lead.findByPk(
        leadId
      );

    if (!lead) {
      const error =
        new Error(
          "Lead not found"
        );

      error.status =
        404;

      throw error;
    }

    if (
      lead.stage !==
      "WON"
    ) {
      const error =
        new Error(
          "Only WON deals can be handed over"
        );

      error.status =
        400;

      throw error;
    }

    const existing =
      await BuildHandover.findOne({
        where: {
          leadId,
        },
      });

    if (existing) {
      return existing;
    }

    const [
      c2,
      commercial,
      closure,
    ] =
      await Promise.all([
        C2Profile.findOne({
          where: {
            leadId,
          },
        }),

        CommercialProfile.findOne({
          where: {
            leadId,
          },
        }),

        C4Closure.findOne({
          where: {
            leadId,
          },
        }),
      ]);

    return BuildHandover.create({
      leadId,

      handoverCode:
        await nextCode(),

      projectName:
        `${lead.companyName} Project`,

      clientName:
        lead.companyName,

      finalScopeSummary:
        c2?.businessRequirementSummary ||
        c2?.currentWorkflow ||
        "",

      commercialSummary:
        closure
          ? `Final Deal Value: ${closure.finalDealValue || 0}; Advance: ${closure.advanceAmount || 0}; Payment: ${closure.paymentStatus}`
          : commercial
            ? `Quotation: ${commercial.quotationAmount || 0}`
            : "",

      keyRequirements:
        c2?.mustHaveRequirements ||
        [],

      importantDependencies:
        c2?.integrations ||
        [],

      referenceUrls: [
        c2?.brdUrl,
        c2?.prdUrl,
        c2?.costingUrl,
        commercial?.proposalUrl,
        commercial?.quotationUrl,
        closure?.agreementUrl,
        closure?.purchaseOrderUrl,
      ].filter(
        Boolean
      ),

      handoverStatus:
        "DRAFT",

      createdById:
        currentUser.id,

      updatedById:
        currentUser.id,
    });
  };

export const updateHandover =
  async (
    id,
    payload,
    currentUser
  ) => {
    const handover =
      await BuildHandover.findByPk(
        id
      );

    if (!handover) {
      const error =
        new Error(
          "Handover not found"
        );

      error.status =
        404;

      throw error;
    }

    if (
      payload.handoverStatus ===
      "HANDED_OVER"
    ) {
      payload.handedOverAt =
        new Date();
    }

    await handover.update({
      ...payload,

      updatedById:
        currentUser.id,
    });

    return handover;
  };
