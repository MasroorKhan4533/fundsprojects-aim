import Deal from "../deals/deal.model.js";
import { calculateCommercial } from "../deals/deal.service.js";
import { getAimDashboard } from "../dashboard/dashboard.service.js";
import { aggregateTargets } from "../targets/target.service.js";

export const getMyProfile = async (actor) => {
  const assignedTo = String(actor._id);
  const [dashboard, targets, wonDeals] = await Promise.all([
    getAimDashboard({ assignedTo }, actor),
    aggregateTargets({ assignedTo }, actor),
    Deal.find({ assignedTo: actor._id, dealStatus: "WON" })
      .select("permanentLeadId finalValue customCommissionPercent payoutMonths payoutStart updatedAt")
      .sort({ updatedAt: -1 })
      .lean(),
  ]);

  const commissionRows = wonDeals.map((deal) => {
    const commercial = calculateCommercial(deal);
    return {
      permanentLeadId: deal.permanentLeadId,
      dealValue: Number(deal.finalValue || 0),
      rate: commercial.commissionRate,
      total: commercial.commissionTotal,
      payoutMonths: commercial.payoutMonths,
      monthlyPayout: commercial.monthlyPayout,
      payoutStart: deal.payoutStart || null,
    };
  });

  return {
    identity: {
      id: String(actor._id),
      userId: actor.userId,
      fullName: actor.fullName,
      email: actor.email,
      mobile: actor.mobile,
      designation: actor.designation,
      role: actor.role,
      status: actor.status,
      lastLoginAt: actor.lastLoginAt,
    },
    targets,
    actuals: dashboard.actuals,
    achievement: dashboard.achievement,
    pipeline: dashboard.pipeline,
    upcoming: dashboard.upcoming,
    commission: {
      wonDeals: commissionRows.length,
      total: commissionRows.reduce((sum, row) => sum + row.total, 0),
      monthlyProjected: commissionRows.reduce((sum, row) => sum + row.monthlyPayout, 0),
      rows: commissionRows.slice(0, 10),
    },
  };
};
