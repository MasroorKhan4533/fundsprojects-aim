import mongoose from "mongoose";
import { AppError } from "../../core/errors/app-error.js";
import { recordAudit } from "../audit/audit.service.js";
import Lead from "../leads/lead.model.js";
import BuildHandover from "./build-handover.model.js";
import Deal from "./deal.model.js";

const safeUser = (value) => value && typeof value === "object" ? { id: String(value._id), userId: value.userId, fullName: value.fullName, email: value.email } : value ? { id: String(value) } : null;
const toDateOrNull = (value) => value ? new Date(value) : null;
const versionMap = (items = []) => ["V1", "V2", "V3"].map((label) => items.find((item) => item.label === label) || { label, modules: "", timeline: "", cost: 0 });
const canMutate = (lead, actor) => actor.role === "ADMIN" || String(lead.assignedTo?._id || lead.assignedTo) === String(actor._id);

const requireLead = async (id) => {
  const lead = await Lead.findOne({ _id: id, deletedAt: null }).populate("assignedTo", "userId fullName email");
  if (!lead) throw new AppError("Lead not found", { statusCode: 404, code: "LEAD_NOT_FOUND" });
  return lead;
};
const requireAccess = (lead, actor) => { if (!canMutate(lead, actor)) throw new AppError("You can only manage C3/C4 for leads assigned to you", { statusCode: 403, code: "DEAL_FORBIDDEN" }); };

const commissionRate = (value, custom = 0) => custom > 0 ? custom : value <= 500000 ? 3 : value <= 1000000 ? 7 : value <= 2000000 ? 10 : 15;
const payoutMonths = (value, custom = 0) => custom > 0 ? custom : value <= 500000 ? 2 : value <= 1000000 ? 3 : value <= 2000000 ? 4 : 5;
export const calculateCommercial = (deal) => {
  const value = deal?.finalValue || 0; const rate = commissionRate(value, deal?.customCommissionPercent || 0); const months = payoutMonths(value, deal?.payoutMonths || 0); const total = value * rate / 100;
  return { commissionRate: rate, commissionTotal: total, payoutMonths: months, monthlyPayout: months ? total / months : 0 };
};

const presentDeal = (deal) => deal ? ({
  id: String(deal._id), leadId: String(deal.leadId?._id || deal.leadId), permanentLeadId: deal.permanentLeadId, assignedTo: safeUser(deal.assignedTo),
  stage: deal.stage, budget: deal.budget || 0, probability: deal.probability || 0, expectedClose: deal.expectedClose, versions: deal.versions || [], preferredVersion: deal.preferredVersion || "", proposalVersion: deal.proposalVersion || "", proposalStatus: deal.proposalStatus, proposalUrl: deal.proposalUrl || "", quotationUrl: deal.quotationUrl || "", negotiationNotes: deal.negotiationNotes || "", c3At: deal.c3At,
  finalVersion: deal.finalVersion || "", finalValue: deal.finalValue || 0, discountPercent: deal.discountPercent || 0, advanceAmount: deal.advanceAmount || 0, paymentStatus: deal.paymentStatus, dealStatus: deal.dealStatus, finalScope: deal.finalScope || "", paymentTerms: deal.paymentTerms || "", agreementUrl: deal.agreementUrl || "", ndaUrl: deal.ndaUrl || "", poUrl: deal.poUrl || "", agreementFileName: deal.agreementFileName || "", customCommissionPercent: deal.customCommissionPercent || 0, payoutStart: deal.payoutStart, payoutMonths: deal.payoutMonths || 0, approvedTimeline: deal.approvedTimeline || "", closureNotes: deal.closureNotes || "", c4At: deal.c4At,
  commercial: calculateCommercial(deal), createdAt: deal.createdAt, updatedAt: deal.updatedAt,
}) : null;

const presentLead = (lead, deal = null, handover = null) => ({
  id: String(lead._id), permanentLeadId: lead.permanentLeadId, companyName: lead.companyName, primaryContact: lead.primaryContact || {}, industry: lead.industry, city: lead.city, estimatedBudget: lead.estimatedBudget || 0, salesStage: lead.salesStage, temperature: lead.temperature, assignedTo: safeUser(lead.assignedTo), nextAction: lead.nextAction || "", nextFollowUpDate: lead.nextFollowUpDate,
  deal: presentDeal(deal), handover: handover ? { id: String(handover._id), status: handover.status, createdAt: handover.createdAt } : null,
});

const findOrCreateDeal = async (lead, actor) => {
  let deal = await Deal.findOne({ leadId: lead._id });
  if (!deal) deal = await Deal.create({ leadId: lead._id, permanentLeadId: lead.permanentLeadId, assignedTo: lead.assignedTo?._id || lead.assignedTo, budget: lead.estimatedBudget || 0, createdBy: actor._id, updatedBy: actor._id });
  return deal;
};

export const saveC3 = async (leadId, body, actor, context) => {
  const lead = await requireLead(leadId); requireAccess(lead, actor); const deal = await findOrCreateDeal(lead, actor);
  Object.assign(deal, { stage: "C3", budget: body.budget, probability: body.probability, expectedClose: toDateOrNull(body.expectedClose), versions: versionMap(body.versions), preferredVersion: body.preferredVersion, proposalVersion: body.proposalVersion, proposalStatus: body.proposalStatus, proposalUrl: body.proposalUrl, quotationUrl: body.quotationUrl, negotiationNotes: body.negotiationNotes, c3At: deal.c3At || new Date(), updatedBy: actor._id });
  await deal.save(); lead.salesStage = "C3"; lead.updatedBy = actor._id; await lead.save();
  await recordAudit({ action: "DEAL.C3.SAVED", actorUserId: actor._id, targetUserId: lead.assignedTo?._id || lead.assignedTo, context, metadata: { leadId: String(lead._id), permanentLeadId: lead.permanentLeadId, dealId: String(deal._id), proposalStatus: deal.proposalStatus } });
  await deal.populate("assignedTo", "userId fullName email"); return presentDeal(deal);
};

export const saveC4 = async (leadId, body, actor, context) => {
  const lead = await requireLead(leadId); requireAccess(lead, actor); const deal = await findOrCreateDeal(lead, actor);
  Object.assign(deal, { stage: "C4", finalVersion: body.finalVersion, finalValue: body.finalValue, discountPercent: body.discountPercent, advanceAmount: body.advanceAmount, paymentStatus: body.paymentStatus, dealStatus: body.dealStatus, finalScope: body.finalScope, paymentTerms: body.paymentTerms, agreementUrl: body.agreementUrl, ndaUrl: body.ndaUrl, poUrl: body.poUrl, agreementFileName: body.agreementFileName, customCommissionPercent: body.customCommissionPercent, payoutStart: toDateOrNull(body.payoutStart), payoutMonths: body.payoutMonths, approvedTimeline: body.approvedTimeline, closureNotes: body.closureNotes, probability: body.dealStatus === "WON" ? 100 : deal.probability, c4At: deal.c4At || new Date(), updatedBy: actor._id });
  await deal.save(); lead.salesStage = body.dealStatus === "WON" ? "Won" : body.dealStatus === "LOST" ? "Lost" : "C4"; lead.updatedBy = actor._id; await lead.save();
  await recordAudit({ action: `DEAL.C4.${body.dealStatus}`, actorUserId: actor._id, targetUserId: lead.assignedTo?._id || lead.assignedTo, context, metadata: { leadId: String(lead._id), permanentLeadId: lead.permanentLeadId, dealId: String(deal._id), finalValue: deal.finalValue } });
  await deal.populate("assignedTo", "userId fullName email"); return presentDeal(deal);
};

export const getDealForLead = async (leadId, actor) => { const lead = await requireLead(leadId); requireAccess(lead, actor); const deal = await Deal.findOne({ leadId }).populate("assignedTo", "userId fullName email"); return { lead: presentLead(lead, deal), deal: presentDeal(deal) }; };

export const createBuildHandover = async (leadId, actor, context) => {
  const lead = await requireLead(leadId); requireAccess(lead, actor); const deal = await Deal.findOne({ leadId });
  if (!deal) throw new AppError("Create the commercial opportunity first", { statusCode: 409, code: "DEAL_REQUIRED" });
  if (deal.dealStatus !== "WON") throw new AppError("Only a Won deal can move to BUILD", { statusCode: 409, code: "BUILD_REQUIRES_WON" });
  if (!deal.agreementUrl && !deal.agreementFileName) throw new AppError("Agreement is required before BUILD handover", { statusCode: 409, code: "BUILD_REQUIRES_AGREEMENT" });
  if (!(deal.advanceAmount > 0)) throw new AppError("Advance / token amount is required before BUILD handover", { statusCode: 409, code: "BUILD_REQUIRES_ADVANCE" });
  const handover = await BuildHandover.findOneAndUpdate({ dealId: deal._id }, { $setOnInsert: { dealId: deal._id, leadId: lead._id, permanentLeadId: lead.permanentLeadId, assignedTo: deal.assignedTo, status: "CREATED", finalValue: deal.finalValue, finalScope: deal.finalScope, approvedTimeline: deal.approvedTimeline, agreementUrl: deal.agreementUrl, poUrl: deal.poUrl, createdBy: actor._id } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  await recordAudit({ action: "BUILD.HANDOVER.CREATED", actorUserId: actor._id, targetUserId: deal.assignedTo, context, metadata: { leadId: String(lead._id), permanentLeadId: lead.permanentLeadId, dealId: String(deal._id), handoverId: String(handover._id) } });
  return { id: String(handover._id), leadId: String(handover.leadId), permanentLeadId: handover.permanentLeadId, status: handover.status, finalValue: handover.finalValue, createdAt: handover.createdAt };
};

export const getBuildHandover = async (leadId, actor) => { const lead = await requireLead(leadId); requireAccess(lead, actor); const handover = await BuildHandover.findOne({ leadId }).lean(); return handover ? { id: String(handover._id), leadId: String(handover.leadId), permanentLeadId: handover.permanentLeadId, status: handover.status, finalValue: handover.finalValue, createdAt: handover.createdAt } : null; };

export const listCommercialWorkbench = async (query, actor) => {
  const owner = actor.role === "ADMIN" ? query.assignedTo : String(actor._id);
  const leadFilter = { deletedAt: null, salesStage: mongoose.trusted({ $in: ["C3", "C4", "Won", "Lost"] }) };
  if (owner) leadFilter.assignedTo = new mongoose.Types.ObjectId(owner);
  if (query.search) leadFilter.companyName = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const [leads, total] = await Promise.all([
    Lead.find(leadFilter).populate("assignedTo", "userId fullName email").sort({ updatedAt: -1, _id: -1 }).skip((query.page - 1) * query.limit).limit(query.limit).lean(),
    Lead.countDocuments(leadFilter),
  ]);
  const leadIds = leads.map((lead) => lead._id);
  const deals = leadIds.length ? await Deal.find({ leadId: mongoose.trusted({ $in: leadIds }) }).populate("assignedTo", "userId fullName email").lean() : [];
  const handovers = leadIds.length ? await BuildHandover.find({ leadId: mongoose.trusted({ $in: leadIds }) }).lean() : [];
  const dealByLead = new Map(deals.map((deal) => [String(deal.leadId), deal])); const handoverByLead = new Map(handovers.map((item) => [String(item.leadId), item]));
  let items = leads.map((lead) => presentLead(lead, dealByLead.get(String(lead._id)), handoverByLead.get(String(lead._id))));
  if (query.dealStatus) items = items.filter((item) => item.deal?.dealStatus === query.dealStatus);
  if (query.stage) items = items.filter((item) => item.deal?.stage === query.stage || item.salesStage === query.stage);
  if (query.proposalStatus) items = items.filter((item) => item.deal?.proposalStatus === query.proposalStatus);
  return { items, meta: { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) } };
};

export const getDealSummary = async (query, actor) => {
  const owner = actor.role === "ADMIN" ? query.assignedTo : String(actor._id); const match = {};
  if (owner) match.assignedTo = new mongoose.Types.ObjectId(owner);
  const deals = await Deal.find(match).lean(); const handoffMatch = owner ? { assignedTo: new mongoose.Types.ObjectId(owner) } : {};
  const handoffs = await BuildHandover.countDocuments(handoffMatch);
  const active = deals.filter((deal) => ["ACTIVE", "ON_HOLD"].includes(deal.dealStatus)); const won = deals.filter((deal) => deal.dealStatus === "WON");
  const openValue = active.reduce((sum, deal) => sum + (deal.budget || 0), 0); const weightedValue = active.reduce((sum, deal) => sum + (deal.budget || 0) * (deal.probability || 0) / 100, 0);
  return { totalDeals: deals.length, c3: deals.filter((deal) => deal.c3At).length, c4: deals.filter((deal) => deal.c4At).length, proposals: deals.filter((deal) => deal.proposalStatus && deal.proposalStatus !== "PENDING").length, activeDeals: active.length, openValue, weightedValue, wonRevenue: won.reduce((sum, deal) => sum + (deal.finalValue || 0), 0), averageProbability: deals.length ? Math.round(deals.reduce((sum, deal) => sum + (deal.probability || 0), 0) / deals.length) : 0, buildHandoffs: handoffs };
};
