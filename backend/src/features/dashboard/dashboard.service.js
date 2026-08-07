import { Op } from "sequelize";

import Lead from "../leads/lead.model.js";
import Activity from "../c1/activity.model.js";
import FollowUp from "../c1/follow-up.model.js";
import CommercialProfile from "../c3/commercial-profile.model.js";
import C4Closure from "../c4/c4-closure.model.js";

/*
  Master dashboard calculations.
*/

export const getDashboard =
  async () => {
    const today =
      new Date();

    const start =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

    const end =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999
      );

    const [
      total,
      c1,
      c2,
      c3,
      c4,
      won,
      lost,
      hot,
      callsToday,
      meetingsToday,
      pendingFollowUps,
      overdueFollowUps,
      commercial,
      closures,
    ] =
      await Promise.all([
        Lead.count(),

        Lead.count({
          where: {
            stage: "C1",
          },
        }),

        Lead.count({
          where: {
            stage: "C2",
          },
        }),

        Lead.count({
          where: {
            stage: "C3",
          },
        }),

        Lead.count({
          where: {
            stage: "C4",
          },
        }),

        Lead.count({
          where: {
            stage: "WON",
          },
        }),

        Lead.count({
          where: {
            stage: "LOST",
          },
        }),

        Lead.count({
          where: {
            temperature:
              "HOT",
          },
        }),

        Activity.count({
          where: {
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
            status:
              "PENDING",
          },
        }),

        FollowUp.count({
          where: {
            status:
              "PENDING",

            followUpAt: {
              [Op.lt]:
                new Date(),
            },
          },
        }),

        CommercialProfile.findAll(),

        C4Closure.findAll(),
      ]);

    const pipelineValue =
      commercial.reduce(
        (
          sum,
          item
        ) =>
          sum +
          Number(
            item.quotationAmount ||
              item.proposalAmount ||
              0
          ),
        0
      );

    const wonValue =
      closures
        .filter(
          (item) =>
            item.status ===
            "WON"
        )
        .reduce(
          (
            sum,
            item
          ) =>
            sum +
            Number(
              item.finalDealValue ||
                0
            ),
          0
        );

    const conversionRate =
      total > 0
        ? Number(
            (
              (won /
                total) *
              100
            ).toFixed(2)
          )
        : 0;

    return {
      totalLeads:
        total,

      stages: {
        c1,
        c2,
        c3,
        c4,
        won,
        lost,
      },

      hotLeads:
        hot,

      callsToday,

      meetingsToday,

      pendingFollowUps,

      overdueFollowUps,

      pipelineValue,

      wonValue,

      conversionRate,
    };
  };
