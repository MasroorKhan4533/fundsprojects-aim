import mongoose from "mongoose";
import User from "../users/user.model.js";
import Lead from "../leads/lead.model.js";
import Interaction from "../interactions/interaction.model.js";
import { aggregateTargets } from "../targets/target.service.js";

const zeroActuals = () => ({ leads: 0, emails: 0, messages: 0, calls: 0, meetings: 0, c1: 0, c2: 0, c3: 0, c4: 0, proposals: 0, revenue: 0 });
const pct = (actual, target) => target > 0 ? Math.min(999, Math.round((actual / target) * 100)) : 0;
const startOfDay = (value) => value ? new Date(`${value}T00:00:00.000Z`) : null;
const endOfDay = (value) => value ? new Date(`${value}T23:59:59.999Z`) : null;

const leadScope = (query, actor) => {
  const match = { deletedAt: null };
  const owner = actor.role === "ADMIN" ? query.assignedTo : String(actor._id);
  if (owner) match.assignedTo = new mongoose.Types.ObjectId(owner);
  if (query.dateFrom || query.dateTo) {
    const createdAtRange = {};
    if (query.dateFrom) createdAtRange.$gte = startOfDay(query.dateFrom);
    if (query.dateTo) createdAtRange.$lte = endOfDay(query.dateTo);
    match.createdAt = mongoose.trusted(createdAtRange);
  }
  return match;
};

const interactionActuals = async (leadMatch, query) => {
  const leadIds = await Lead.find(leadMatch).distinct("_id");
  const match = { leadId: { $in: leadIds } };
  if (query.dateFrom || query.dateTo) {
    const range = {};
    if (query.dateFrom) range.$gte = startOfDay(query.dateFrom);
    if (query.dateTo) range.$lte = endOfDay(query.dateTo);
    match.occurredAt = mongoose.trusted(range);
  }
  const rows = await Interaction.aggregate([{ $match: match }, { $group: { _id: null,
    emails: { $sum: { $cond: [{ $eq: ["$channel", "EMAIL"] }, 1, 0] } },
    messages: { $sum: { $cond: [{ $eq: ["$channel", "WHATSAPP"] }, 1, 0] } },
    calls: { $sum: { $cond: [{ $eq: ["$channel", "CALL"] }, 1, 0] } },
    meetings: { $sum: { $cond: [{ $in: ["$channel", ["ONLINE_MEETING", "OFFLINE_MEETING"]] }, 1, 0] } },
    c1: { $sum: { $cond: [{ $eq: ["$stage", "C1"] }, 1, 0] } },
    c2: { $sum: { $cond: [{ $eq: ["$stage", "C2"] }, 1, 0] } },
  } }]);
  return rows[0] || {};
};

export const getAimDashboard = async (query, actor) => {
  const leadMatch = leadScope(query, actor);
  const [targets, activeUsers, leadCount, sectorMix, upcoming, interactionCounts] = await Promise.all([
    aggregateTargets(query, actor),
    User.countDocuments({ status: "ACTIVE" }),
    Lead.countDocuments(leadMatch),
    Lead.aggregate([{ $match: leadMatch }, { $group: { _id: "$industry", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 6 }]),
    Lead.find({ ...leadMatch, nextFollowUpDate: mongoose.trusted({ $ne: null, $gte: new Date() }) }).select("permanentLeadId companyName nextAction nextFollowUpDate assignedTo").populate("assignedTo", "userId fullName").sort({ nextFollowUpDate: 1 }).limit(7).lean(),
    interactionActuals(leadMatch, query),
  ]);

  const actuals = { ...zeroActuals(), leads: leadCount, emails: interactionCounts.emails || 0, messages: interactionCounts.messages || 0, calls: interactionCounts.calls || 0, meetings: interactionCounts.meetings || 0, c1: interactionCounts.c1 || 0, c2: interactionCounts.c2 || 0 };
  const achievement = Object.fromEntries(Object.keys(actuals).map((key) => [key, pct(actuals[key], targets[key] || 0)]));
  return {
    scope: { assignedTo: actor.role === "ADMIN" ? query.assignedTo || null : String(actor._id), dateFrom: query.dateFrom || null, dateTo: query.dateTo || null },
    team: { activeUsers }, targets, actuals, achievement,
    pipeline: { openValue: 0, weightedValue: 0, wonRevenue: 0, activeDeals: 0, averageProbability: 0 },
    sectorMix: sectorMix.map((item) => ({ industry: item._id || "Unspecified", count: item.count })),
    upcoming: upcoming.map((item) => ({ id: String(item._id), permanentLeadId: item.permanentLeadId, companyName: item.companyName, nextAction: item.nextAction || "Follow up", nextFollowUpDate: item.nextFollowUpDate, assignedTo: item.assignedTo ? { id: String(item.assignedTo._id), userId: item.assignedTo.userId, fullName: item.assignedTo.fullName } : null })),
    dataReadiness: { targets: true, leads: true, c1c2: true, c3c4: false },
  };
};
