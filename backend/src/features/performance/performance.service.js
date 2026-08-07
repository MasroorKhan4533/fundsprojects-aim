import User from "../users/user.model.js";
import Lead from "../leads/lead.model.js";
import Activity from "../c1/activity.model.js";
import FollowUp from "../c1/follow-up.model.js";

/*
  Computes team performance using stored operational data.
*/

export const getPerformance =
  async () => {
    const users =
      await User.findAll({
        where: {
          status:
            "ACTIVE",
        },

        attributes: [
          "id",
          "fullName",
          "email",
          "role",
        ],
      });

    return Promise.all(
      users.map(
        async (
          user
        ) => {
          const [
            leads,
            activities,
            calls,
            meetings,
            completedFollowUps,
            won,
          ] =
            await Promise.all([
              Lead.count({
                where: {
                  assignedOwnerId:
                    user.id,
                },
              }),

              Activity.count({
                where: {
                  performedById:
                    user.id,
                },
              }),

              Activity.count({
                where: {
                  performedById:
                    user.id,

                  activityType:
                    "CALL",
                },
              }),

              Activity.count({
                where: {
                  performedById:
                    user.id,
                },
              }),

              FollowUp.count({
                where: {
                  assignedUserId:
                    user.id,

                  status:
                    "COMPLETED",
                },
              }),

              Lead.count({
                where: {
                  assignedOwnerId:
                    user.id,

                  stage:
                    "WON",
                },
              }),
            ]);

          const conversionRate =
            leads > 0
              ? Number(
                  (
                    (won /
                      leads) *
                    100
                  ).toFixed(
                    2
                  )
                )
              : 0;

          return {
            user,

            leads,
            activities,
            calls,
            meetings,
            completedFollowUps,
            won,
            conversionRate,
          };
        }
      )
    );
  };
