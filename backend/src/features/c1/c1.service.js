import { sequelize } from "../../config/database.js";

import User from "../users/user.model.js";

import Lead from "../leads/lead.model.js";
import LeadContact from "../leads/lead-contact.model.js";
import LeadComment from "../leads/lead-comment.model.js";
import LeadAudit from "../leads/lead-audit.model.js";

import C1Profile from "./c1-profile.model.js";
import Activity from "./activity.model.js";
import FollowUp from "./follow-up.model.js";

import {
  requireLead,
  requireLeadEditAccess,
} from "../leads/lead.service.js";

const nextCode = async (
  sequence,
  prefix
) => {
  const [rows] =
    await sequelize.query(
      `SELECT nextval('${sequence}') AS value`
    );

  return `${prefix}-${String(
    Number(rows[0].value)
  ).padStart(6, "0")}`;
};

export const listC1Leads =
  async () => {
    const leads =
      await Lead.findAll({
        where: {
          stage: "C1",
        },

        include: [
          {
            model: LeadContact,
            as: "contacts",
            where: {
              isPrimary: true,
            },
            required: false,
          },

          {
            model: User,
            as: "assignedOwner",
            attributes: [
              "id",
              "fullName",
              "email",
            ],
          },
        ],

        order: [
          ["updatedAt", "DESC"],
        ],
      });

    return Promise.all(
      leads.map(
        async (lead) => {
          const lastActivity =
            await Activity.findOne({
              where: {
                leadId: lead.id,
              },

              order: [
                [
                  "activityAt",
                  "DESC",
                ],
              ],
            });

          const nextFollowUp =
            await FollowUp.findOne({
              where: {
                leadId: lead.id,
                status: "PENDING",
              },

              order: [
                [
                  "followUpAt",
                  "ASC",
                ],
              ],
            });

          return {
            ...lead.toJSON(),
            lastActivity,
            nextFollowUp,
          };
        }
      )
    );
  };

export const getSummary =
  async (leadId) => {
    const lead =
      await requireLead(leadId);

    const profile =
      await C1Profile.findOne({
        where: {
          leadId,
        },
      });

    const activities =
      await Activity.findAll({
        where: {
          leadId,
        },

        include: [
          {
            model: User,
            as: "performedBy",
            attributes: [
              "id",
              "fullName",
              "email",
            ],
          },

          {
            model: LeadContact,
            as: "contactPerson",
          },
        ],

        order: [
          [
            "activityAt",
            "DESC",
          ],
        ],
      });

    const followUps =
      await FollowUp.findAll({
        where: {
          leadId,
        },

        include: [
          {
            model: User,
            as: "assignedUser",
            attributes: [
              "id",
              "fullName",
              "email",
            ],
          },
        ],

        order: [
          [
            "followUpAt",
            "ASC",
          ],
        ],
      });

    const followUpsWithDisplayStatus =
      followUps.map(
        (followUp) => {
          const row =
            followUp.toJSON();

          if (
            row.status ===
              "PENDING" &&
            new Date(
              row.followUpAt
            ) < new Date()
          ) {
            row.displayStatus =
              "OVERDUE";
          } else {
            row.displayStatus =
              row.status;
          }

          return row;
        }
      );

    return {
      lead,
      profile,
      activities,
      followUps:
        followUpsWithDisplayStatus,
    };
  };

export const saveProfile =
  async (
    leadId,
    payload,
    currentUser
  ) => {
    const lead =
      await requireLead(leadId);

    requireLeadEditAccess(
      lead,
      currentUser
    );

    const existing =
      await C1Profile.findOne({
        where: {
          leadId,
        },
      });

    if (existing) {
      await existing.update({
        ...payload,
        updatedById:
          currentUser.id,
      });

      return existing;
    }

    return C1Profile.create({
      leadId,
      ...payload,
      updatedById:
        currentUser.id,
    });
  };

export const createActivity =
  async (
    leadId,
    payload,
    currentUser
  ) => {
    const lead =
      await requireLead(leadId);

    requireLeadEditAccess(
      lead,
      currentUser
    );

    const businessId =
      await nextCode(
        "activity_business_id_seq",
        "AIM-ACT"
      );

    const activity =
      await Activity.create({
        ...payload,

        businessId,
        leadId,

        activityAt:
          payload.activityAt
            ? new Date(
                payload.activityAt
              )
            : new Date(),

        nextFollowUpAt:
          payload.nextFollowUpAt
            ? new Date(
                payload.nextFollowUpAt
              )
            : null,

        performedById:
          currentUser.id,
      });

    if (
      payload.nextFollowUpAt
    ) {
      await FollowUp.create({
        businessId:
          await nextCode(
            "follow_up_business_id_seq",
            "AIM-FU"
          ),

        leadId,

        followUpAt:
          new Date(
            payload.nextFollowUpAt
          ),

        followUpType:
          payload.activityType,

        purpose:
          payload.nextAction ||
          "Activity follow-up",

        notes:
          payload.notes,

        assignedUserId:
          currentUser.id,

        createdById:
          currentUser.id,
      });
    }

    const profile =
      await C1Profile.findOne({
        where: {
          leadId,
        },
      });

    if (
      profile &&
      profile.status ===
        "NOT_STARTED"
    ) {
      profile.status =
        "IN_PROGRESS";

      await profile.save();
    }

    return activity;
  };

export const createFollowUp =
  async (
    leadId,
    payload,
    currentUser
  ) => {
    const lead =
      await requireLead(leadId);

    requireLeadEditAccess(
      lead,
      currentUser
    );

    return FollowUp.create({
      businessId:
        await nextCode(
          "follow_up_business_id_seq",
          "AIM-FU"
        ),

      leadId,

      followUpAt:
        new Date(
          payload.followUpAt
        ),

      followUpType:
        payload.followUpType,

      purpose:
        payload.purpose,

      notes:
        payload.notes,

      assignedUserId:
        payload.assignedUserId ||
        currentUser.id,

      createdById:
        currentUser.id,
    });
  };

export const updateFollowUp =
  async (
    leadId,
    followUpId,
    payload,
    currentUser
  ) => {
    const lead =
      await requireLead(leadId);

    requireLeadEditAccess(
      lead,
      currentUser
    );

    const followUp =
      await FollowUp.findOne({
        where: {
          id: followUpId,
          leadId,
        },
      });

    if (!followUp) {
      const error =
        new Error(
          "Follow-up not found"
        );

      error.status = 404;

      throw error;
    }

    if (
      payload.followUpAt
    ) {
      payload.followUpAt =
        new Date(
          payload.followUpAt
        );
    }

    await followUp.update(
      payload
    );

    return followUp;
  };

export const setOutcome =
  async (
    leadId,
    payload,
    currentUser
  ) => {
    const lead =
      await requireLead(leadId);

    requireLeadEditAccess(
      lead,
      currentUser
    );

    if (
      payload.outcome ===
      "CONTINUE"
    ) {
      return lead;
    }

    if (
      payload.outcome ===
      "LOST"
    ) {
      if (
        !payload.lossReason
          ?.trim()
      ) {
        const error =
          new Error(
            "Loss reason is required"
          );

        error.status = 400;

        throw error;
      }

      const oldStage =
        lead.stage;

      lead.stage =
        "LOST";

      lead.lossReason =
        payload.lossReason;

      await lead.save();

      const profile =
        await C1Profile.findOne({
          where: {
            leadId,
          },
        });

      if (profile) {
        profile.status =
          "LOST";

        await profile.save();
      }

      await LeadAudit.create({
        leadId,

        action:
          "STAGE_CHANGED",

        fieldName:
          "stage",

        oldValue:
          oldStage,

        newValue: {
          stage: "LOST",
          reason:
            payload.lossReason,
        },

        changedById:
          currentUser.id,
      });

      return lead;
    }

    const profile =
      await C1Profile.findOne({
        where: {
          leadId,
        },
      });

    const activityCount =
      await Activity.count({
        where: {
          leadId,
        },
      });

    const latestActivity =
      await Activity.findOne({
        where: {
          leadId,
        },

        order: [
          [
            "activityAt",
            "DESC",
          ],
        ],
      });

    if (
      !profile
        ?.businessUnderstanding
        ?.trim() ||
      !profile
        ?.initialRequirement
        ?.trim() ||
      activityCount < 1
    ) {
      const error =
        new Error(
          "C1 requires Business Understanding, Initial Requirement and at least one meaningful activity"
        );

      error.status = 400;

      throw error;
    }

    if (
      latestActivity
        ?.customerResponse ===
      "NOT_INTERESTED"
    ) {
      const error =
        new Error(
          "A lead marked Not Interested cannot move to C2"
        );

      error.status = 400;

      throw error;
    }

    const oldStage =
      lead.stage;

    lead.stage =
      "C2";

    lead.lossReason =
      null;

    await lead.save();

    profile.status =
      "QUALIFIED";

    await profile.save();

    await LeadAudit.create({
      leadId,

      action:
        "STAGE_CHANGED",

      fieldName:
        "stage",

      oldValue:
        oldStage,

      newValue:
        "C2",

      changedById:
        currentUser.id,
    });

    return lead;
  };

export const reopenC1 =
  async (
    leadId,
    reason,
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

      error.status = 404;

      throw error;
    }

    if (
      lead.stage !==
      "LOST"
    ) {
      const error =
        new Error(
          "Only Lost leads can be reopened"
        );

      error.status = 400;

      throw error;
    }

    lead.stage =
      "C1";

    lead.lossReason =
      null;

    await lead.save();

    await LeadAudit.create({
      leadId,

      action:
        "LEAD_REOPENED",

      fieldName:
        "stage",

      oldValue:
        "LOST",

      newValue: {
        stage: "C1",
        reason,
      },

      changedById:
        currentUser.id,
    });

    return lead;
  };

export const getTimeline =
  async (leadId) => {
    await requireLead(
      leadId
    );

    const [
      activities,
      followUps,
      comments,
      audits,
    ] =
      await Promise.all([
        Activity.findAll({
          where: {
            leadId,
          },
        }),

        FollowUp.findAll({
          where: {
            leadId,
          },
        }),

        LeadComment.findAll({
          where: {
            leadId,
          },
        }),

        LeadAudit.findAll({
          where: {
            leadId,
          },
        }),
      ]);

    return [
      ...activities.map(
        (item) => ({
          id: item.id,
          type:
            "ACTIVITY",
          title:
            `${item.activityType} — ${
              item.customerResponse ||
              ""
            }`,
          date:
            item.activityAt,
          data: item,
        })
      ),

      ...followUps.map(
        (item) => ({
          id: item.id,
          type:
            "FOLLOW_UP",
          title:
            `${item.followUpType} — ${item.status}`,
          date:
            item.followUpAt,
          data: item,
        })
      ),

      ...comments.map(
        (item) => ({
          id: item.id,
          type:
            "COMMENT",
          title:
            item.comment,
          date:
            item.createdAt,
          data: item,
        })
      ),

      ...audits.map(
        (item) => ({
          id: item.id,
          type:
            "AUDIT",
          title:
            item.action,
          date:
            item.createdAt,
          data: item,
        })
      ),
    ].sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    );
  };
