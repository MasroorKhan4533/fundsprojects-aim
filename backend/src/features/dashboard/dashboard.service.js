import User from "../users/user.model.js";
import { aggregateTargets } from "../targets/target.service.js";

const zeroActuals = () => ({ leads: 0, emails: 0, messages: 0, calls: 0, meetings: 0, c1: 0, c2: 0, c3: 0, c4: 0, proposals: 0, revenue: 0 });
const pct = (actual, target) => target > 0 ? Math.min(999, Math.round((actual / target) * 100)) : 0;

export const getAimDashboard = async (query, actor) => {
  const [targets, activeUsers] = await Promise.all([
    aggregateTargets(query, actor),
    User.countDocuments({ status: "ACTIVE" }),
  ]);

  // Actual lead/activity/deal data intentionally remains zero until Phases 4–6 install the respective domain collections.
  // The response contract is stable now, so later phases can replace these values without changing the dashboard UI.
  const actuals = zeroActuals();
  const achievement = Object.fromEntries(Object.keys(actuals).map((key) => [key, pct(actuals[key], targets[key] || 0)]));
  return {
    scope: { assignedTo: actor.role === "ADMIN" ? query.assignedTo || null : String(actor._id), dateFrom: query.dateFrom || null, dateTo: query.dateTo || null },
    team: { activeUsers },
    targets,
    actuals,
    achievement,
    pipeline: { openValue: 0, weightedValue: 0, wonRevenue: 0, activeDeals: 0, averageProbability: 0 },
    upcoming: [],
    dataReadiness: { targets: true, leads: false, c1c2: false, c3c4: false },
  };
};
