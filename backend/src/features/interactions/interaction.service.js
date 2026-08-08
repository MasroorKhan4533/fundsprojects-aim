import mongoose from "mongoose";
import { AppError } from "../../core/errors/app-error.js";
import { recordAudit } from "../audit/audit.service.js";
import Lead from "../leads/lead.model.js";
import Interaction from "./interaction.model.js";
import JourneyProfile from "./journey-profile.model.js";

const safeUser = (value) => value && typeof value === "object" ? { id: String(value._id), userId: value.userId, fullName: value.fullName, email: value.email } : value ? { id: String(value) } : null;
const toDateOrNull = (value) => value ? new Date(value) : null;
const startOfDay = (value) => new Date(`${value}T00:00:00.000Z`);
const endOfDay = (value) => new Date(`${value}T23:59:59.999Z`);
const cleanArray = (items = []) => [...new Set(items.map((item) => String(item).trim()).filter(Boolean))];

const requireLead = async (id) => {
  const lead = await Lead.findOne({ _id: id, deletedAt: null }).populate("assignedTo", "userId fullName email");
  if (!lead) throw new AppError("Lead not found", { statusCode: 404, code: "LEAD_NOT_FOUND" });
  return lead;
};
const canMutate = (lead, actor) => actor.role === "ADMIN" || String(lead.assignedTo?._id || lead.assignedTo) === String(actor._id);
const requireMutationAccess = (lead, actor) => { if (!canMutate(lead, actor)) throw new AppError("You can only record C1/C2 work on leads assigned to you", { statusCode: 403, code: "INTERACTION_FORBIDDEN" }); };

const present = (item) => ({
  id: String(item._id), leadId: String(item.leadId?._id || item.leadId), permanentLeadId: item.permanentLeadId,
  stage: item.stage, channel: item.channel, occurredAt: item.occurredAt, response: item.response, outcome: item.outcome,
  content: item.content || "", clientResponse: item.clientResponse || "", agenda: item.agenda || "", recordingUrl: item.recordingUrl || "", meetingMode: item.meetingMode || "",
  nextAction: item.nextAction || "", nextFollowUpDate: item.nextFollowUpDate, presentation: item.presentation || {}, demo: item.demo || {}, requirementDocument: item.requirementDocument || {}, costingDocument: item.costingDocument || {}, versionLabel: item.versionLabel || "", attachmentUrl: item.attachmentUrl || "", c1: item.c1 || {}, c2: item.c2 || {}, actor: safeUser(item.actorUserId), createdAt: item.createdAt,
});

const presentJourney = (profile, lead) => ({
  leadId: String(lead._id), permanentLeadId: lead.permanentLeadId, companyName: lead.companyName, salesStage: lead.salesStage,
  assignedTo: safeUser(lead.assignedTo), temperature: lead.temperature, nextAction: lead.nextAction || "", nextFollowUpDate: lead.nextFollowUpDate,
  potentialStatus: profile?.potentialStatus || "UNCLASSIFIED", qualificationStatus: profile?.qualificationStatus || "UNQUALIFIED",
  painPoints: profile?.painPoints || lead.painPoints || [], businessRequirement: profile?.businessRequirement || lead.businessRequirementAnalysis || "", decisionContext: profile?.decisionContext || "", internalNotes: profile?.internalNotes || "", lastC1At: profile?.lastC1At || null, lastC2At: profile?.lastC2At || null,
});

const updateJourneyAndLead = async (lead, body, actor, occurredAt) => {
  const stageUpdate = body.outcome === "MOVE_TO_C2" ? "C2" : body.outcome === "MOVE_TO_C3" ? "C3" : body.outcome === "LOST" ? "Lost" : null;
  if (stageUpdate) lead.salesStage = stageUpdate;
  if (body.temperature) lead.temperature = body.temperature;
  if (body.nextAction !== undefined) lead.nextAction = body.nextAction;
  if (body.nextFollowUpDate !== undefined) lead.nextFollowUpDate = toDateOrNull(body.nextFollowUpDate);
  if (body.painPoints) lead.painPoints = cleanArray(body.painPoints);
  if (body.businessRequirement) lead.businessRequirementAnalysis = body.businessRequirement;
  lead.updatedBy = actor._id;
  await lead.save();

  const set = { updatedBy: actor._id };
  if (body.potentialStatus) set.potentialStatus = body.potentialStatus;
  if (body.qualificationStatus) set.qualificationStatus = body.qualificationStatus;
  if (body.painPoints) set.painPoints = cleanArray(body.painPoints);
  if (body.businessRequirement !== undefined) set.businessRequirement = body.businessRequirement;
  if (body.decisionContext !== undefined) set.decisionContext = body.decisionContext;
  if (body.internalNotes !== undefined) set.internalNotes = body.internalNotes;
  if (body.stage === "C1") set.lastC1At = occurredAt;
  if (body.stage === "C2") set.lastC2At = occurredAt;
  await JourneyProfile.findOneAndUpdate(
    { leadId: lead._id },
    { $set: set, $setOnInsert: { permanentLeadId: lead.permanentLeadId, createdBy: actor._id } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

export const createInteraction = async (body, actor, context) => {
  const lead = await requireLead(body.leadId); requireMutationAccess(lead, actor);
  const occurredAt = body.occurredAt ? new Date(body.occurredAt) : new Date();
  const interaction = await Interaction.create({
    ...body,
    occurredAt,
    nextFollowUpDate: toDateOrNull(body.nextFollowUpDate),
    leadId: lead._id,
    permanentLeadId: lead.permanentLeadId,
    actorUserId: actor._id,
  });
  await updateJourneyAndLead(lead, body, actor, occurredAt);
  await recordAudit({ action: `INTERACTION.${body.stage}.${body.channel}`, actorUserId: actor._id, targetUserId: lead.assignedTo?._id || lead.assignedTo, context, metadata: { leadId: String(lead._id), permanentLeadId: lead.permanentLeadId, interactionId: String(interaction._id), outcome: body.outcome } });
  await interaction.populate("actorUserId", "userId fullName email");
  return present(interaction);
};

const buildFilter = (query, actor) => {
  const filter = {};
  if (query.leadId) filter.leadId = query.leadId;
  if (query.stage) filter.stage = query.stage;
  if (query.channel) filter.channel = query.channel;
  if (query.outcome) filter.outcome = query.outcome;
  if (query.dateFrom || query.dateTo) {
    const range = {};
    if (query.dateFrom) range.$gte = startOfDay(query.dateFrom);
    if (query.dateTo) range.$lte = endOfDay(query.dateTo);
    filter.occurredAt = mongoose.trusted(range);
  }
  const requestedOwner = actor.role === "ADMIN" ? query.assignedTo : String(actor._id);
  return { filter, requestedOwner };
};

export const listInteractions = async (query, actor) => {
  const { filter, requestedOwner } = buildFilter(query, actor);
  if (requestedOwner) {
    const leadIds = await Lead.find({ deletedAt: null, assignedTo: requestedOwner }).distinct("_id");
    filter.leadId = query.leadId ? filter.leadId : { $in: leadIds };
  }
  const [items, total] = await Promise.all([
    Interaction.find(filter).populate("actorUserId", "userId fullName email").sort({ occurredAt: -1, _id: -1 }).skip((query.page - 1) * query.limit).limit(query.limit).lean(),
    Interaction.countDocuments(filter),
  ]);
  return { items: items.map(present), meta: { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) } };
};

export const getJourney = async (leadId, actor) => {
  const lead = await requireLead(leadId);
  if (actor.role !== "ADMIN" && String(lead.assignedTo?._id || lead.assignedTo) !== String(actor._id)) throw new AppError("You can only view the detailed journey for leads assigned to you", { statusCode: 403, code: "JOURNEY_FORBIDDEN" });
  const profile = await JourneyProfile.findOne({ leadId: lead._id }).lean();
  return presentJourney(profile, lead);
};

export const getInteractionSummary = async (query, actor) => {
  const { requestedOwner } = buildFilter(query, actor);
  const leadMatch = { deletedAt: null };
  if (requestedOwner) leadMatch.assignedTo = new mongoose.Types.ObjectId(requestedOwner);
  const leadIds = await Lead.find(leadMatch).distinct("_id");
  const match = { leadId: { $in: leadIds } };
  if (query.dateFrom || query.dateTo) {
    const range = {};
    if (query.dateFrom) range.$gte = startOfDay(query.dateFrom);
    if (query.dateTo) range.$lte = endOfDay(query.dateTo);
    match.occurredAt = mongoose.trusted(range);
  }
  const [rows, pendingFollowUps, c1Leads, c2Leads] = await Promise.all([
    Interaction.aggregate([{ $match: match }, { $group: { _id: null,
      total: { $sum: 1 },
      emails: { $sum: { $cond: [{ $eq: ["$channel", "EMAIL"] }, 1, 0] } },
      messages: { $sum: { $cond: [{ $eq: ["$channel", "WHATSAPP"] }, 1, 0] } },
      calls: { $sum: { $cond: [{ $eq: ["$channel", "CALL"] }, 1, 0] } },
      meetings: { $sum: { $cond: [{ $in: ["$channel", ["ONLINE_MEETING", "OFFLINE_MEETING"]] }, 1, 0] } },
      c1: { $sum: { $cond: [{ $eq: ["$stage", "C1"] }, 1, 0] } },
      c2: { $sum: { $cond: [{ $eq: ["$stage", "C2"] }, 1, 0] } },
      positive: { $sum: { $cond: [{ $eq: ["$response", "POSITIVE"] }, 1, 0] } },
    } }]),
    Interaction.countDocuments({ ...match, nextFollowUpDate: mongoose.trusted({ $ne: null, $gte: new Date() }) }),
    Lead.countDocuments({ ...leadMatch, salesStage: "C1" }),
    Lead.countDocuments({ ...leadMatch, salesStage: "C2" }),
  ]);
  const row = rows[0] || {};
  return { total: row.total || 0, emails: row.emails || 0, messages: row.messages || 0, calls: row.calls || 0, meetings: row.meetings || 0, c1: row.c1 || 0, c2: row.c2 || 0, positiveResponses: row.positive || 0, responseRate: row.total ? Math.round((row.positive || 0) / row.total * 100) : 0, pendingFollowUps, c1Leads, c2Leads };
};
