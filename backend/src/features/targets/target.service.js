import { Op } from "sequelize";

import DailyTarget from "./daily-target.model.js";

import User from "../users/user.model.js";
import Lead from "../leads/lead.model.js";
import Activity from "../c1/activity.model.js";
import FollowUp from "../c1/follow-up.model.js";
import CommercialProfile from "../c3/commercial-profile.model.js";

/*
  Calculates target versus actual automatically.
*/

const dayRange = (
  date
) => {
  const start =
    new Date(
      `${date}T00:00:00`
    );

  const end =
    new Date(
      `${date}T23:59:59.999`
    );

  return {
    start,
    end,
  };
};

export const calculateActuals =
  async (
    userId,
    targetDate
  ) => {
    const {
      start,
      end,
    } =
      dayRange(
        targetDate
      );

    const [
      leads,
      calls,
      meetings,
      followUps,
      proposals,
      closures,
    ] =
      await Promise.all([
        Lead.count({
          where: {
            createdById:
              userId,

            createdAt: {
              [Op.between]:
                [
                  start,
                  end,
                ],
            },
          },
        }),

        Activity.count({
          where: {
            performedById:
              userId,

            activityType:
              "CALL",

            activityAt: {
              [Op.between]:
                [
                  start,
                  end,
                ],
            },
          },
        }),

        Activity.count({
          where: {
            performedById:
              userId,

            activityType: {
              [Op.in]: [
                "ONLINE_MEETING",
                "OFFLINE_MEETING",
              ],
            },

            activityAt: {
              [Op.between]:
                [
                  start,
                  end,
                ],
            },
          },
        }),

        FollowUp.count({
          where: {
            assignedUserId:
              userId,

            status:
              "COMPLETED",

            updatedAt: {
              [Op.between]:
                [
                  start,
                  end,
                ],
            },
          },
        }),

        CommercialProfile.count({
          where: {
            updatedById:
              userId,

            commercialStatus: {
              [Op.in]: [
                "PROPOSAL_SENT",
                "QUOTATION_SENT",
                "NEGOTIATION",
                "COMMERCIAL_AGREED",
              ],
            },

            updatedAt: {
              [Op.between]:
                [
                  start,
                  end,
                ],
            },
          },
        }),

        Lead.count({
          where: {
            assignedOwnerId:
              userId,

            stage:
              "WON",

            updatedAt: {
              [Op.between]:
                [
                  start,
                  end,
                ],
            },
          },
        }),
      ]);

    return {
      leads,
      calls,
      meetings,
      followUps,
      proposals,
      closures,
    };
  };

export const saveTarget =
  async (
    payload,
    currentUser
  ) => {
    const user =
      await User.findByPk(
        payload.userId
      );

    if (!user) {
      const error =
        new Error(
          "User not found"
        );

      error.status =
        404;

      throw error;
    }

    const existing =
      await DailyTarget.findOne({
        where: {
          userId:
            payload.userId,

          targetDate:
            payload.targetDate,
        },
      });

    if (existing) {
      await existing.update(
        payload
      );

      return existing;
    }

    return DailyTarget.create({
      ...payload,

      createdById:
        currentUser.id,
    });
  };

export const listTargets =
  async () => {
    const targets =
      await DailyTarget.findAll({
        include: [
          {
            model: User,
            as: "user",

            attributes: [
              "id",
              "fullName",
              "email",
            ],
          },
        ],

        order: [
          [
            "targetDate",
            "DESC",
          ],
        ],
      });

    return Promise.all(
      targets.map(
        async (
          target
        ) => ({
          ...target.toJSON(),

          actuals:
            await calculateActuals(
              target.userId,
              target.targetDate
            ),
        })
      )
    );
  };

export const deleteTarget =
  async (id) => {
    const target =
      await DailyTarget.findByPk(
        id
      );

    if (!target) {
      const error =
        new Error(
          "Target not found"
        );

      error.status =
        404;

      throw error;
    }

    await target.destroy();
  };
