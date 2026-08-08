import mongoose from "mongoose";
import { AppError } from "../../core/errors/app-error.js";
import Counter from "../auth/models/counter.model.js";
import { recordAudit } from "../audit/audit.service.js";
import User from "../users/user.model.js";
import Lead from "./lead.model.js";
import LeadAudit from "./lead-audit.model.js";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const cleanStringArray = (items = []) => [...new Set(items.map((item) => String(item).trim()).filter(Boolean))];
const toDateOrNull = (value) => value ? new Date(value) : null;

const contextFields = (context = {}) => ({ requestId: context.requestId || "", ip: context.ip || "", userAgent: context.userAgent || "" });

const diffLead = (before, after) => {
  const changes = {};
  for (const key of Object.keys(after)) {
    if (["id", "permanentLeadId", "createdAt", "updatedAt"].includes(key)) continue;
    if (JSON.stringify(before?.[key] ?? null) !== JSON.stringify(after?.[key] ?? null)) changes[key] = { before: before?.[key] ?? null, after: after?.[key] ?? null };
  }
  return changes;
};

const safeUser = (value) => value && typeof value === "object" ? {
  id: String(value._id), userId: value.userId, fullName: value.fullName, email: value.email,
} : value ? { id: String(value) } : null;

export const presentLead = (lead) => ({
  id: String(lead._id),
  permanentLeadId: lead.permanentLeadId,
  companyName: lead.companyName,
  primaryContact: lead.primaryContact,
  contacts: lead.contacts || [],
  industry: lead.industry,
  subSector: lead.subSector || "",
  businessModels: lead.businessModels || [],
  companySize: lead.companySize || "",
  employeeStrength: lead.employeeStrength || "",
  annualTurnover: Number(lead.annualTurnover || 0),
  estimatedBudget: Number(lead.estimatedBudget || 0),
  country: lead.country || "",
  state: lead.state || "",
  city: lead.city || "",
  websiteUrl: lead.websiteUrl || "",
  linkedinPostUrl: lead.linkedinPostUrl || "",
  postDate: lead.postDate,
  postContent: lead.postContent || "",
  businessRequirementAnalysis: lead.businessRequirementAnalysis || "",
  buyingIntentScore: Number(lead.buyingIntentScore || 0),
  leadPriority: lead.leadPriority,
  personalizedComment: lead.personalizedComment || "",
  firstMessage: lead.firstMessage || "",
  followUps: lead.followUps || [],
  salesStage: lead.salesStage,
  assignedTo: safeUser(lead.assignedTo),
  source: lead.source,
  temperature: lead.temperature,
  decisionMakers: lead.decisionMakers || "",
  companyOverview: lead.companyOverview || "",
  painPoints: lead.painPoints || [],
  internalComments: lead.internalComments || "",
  nextAction: lead.nextAction || "",
  nextFollowUpDate: lead.nextFollowUpDate,
  attachmentUrl: lead.attachmentUrl || "",
  researchNotes: lead.researchNotes || "",
  deletedAt: lead.deletedAt,
  createdAt: lead.createdAt,
  updatedAt: lead.updatedAt,
});

const requireActiveUser = async (id) => {
  const user = await User.findOne({ _id: id, status: "ACTIVE" });
  if (!user) throw new AppError("Assigned owner must be an active user", { statusCode: 422, code: "LEAD_OWNER_INVALID" });
  return user;
};

const requireLead = async (id, { includeDeleted = false } = {}) => {
  const filter = { _id: id };
  if (!includeDeleted) filter.deletedAt = null;
  const lead = await Lead.findOne(filter).populate("assignedTo", "userId fullName email");
  if (!lead) throw new AppError("Lead not found", { statusCode: 404, code: "LEAD_NOT_FOUND" });
  return lead;
};

const canMutate = (lead, actor) => actor.role === "ADMIN" || String(lead.assignedTo?._id || lead.assignedTo) === String(actor._id);

const nextLeadId = async () => {
  const counter = await Counter.findOneAndUpdate({ _id: "lead" }, { $inc: { sequence: 1 } }, { new: true, upsert: true, setDefaultsOnInsert: true });
  return `AIM-L-${String(counter.sequence).padStart(6, "0")}`;
};

const normalizeBody = (body) => {
  const normalized = { ...body };
  if (Object.prototype.hasOwnProperty.call(body, "businessModels")) normalized.businessModels = cleanStringArray(body.businessModels);
  if (Object.prototype.hasOwnProperty.call(body, "painPoints")) normalized.painPoints = cleanStringArray(body.painPoints);
  if (Object.prototype.hasOwnProperty.call(body, "postDate")) normalized.postDate = toDateOrNull(body.postDate);
  if (Object.prototype.hasOwnProperty.call(body, "nextFollowUpDate")) normalized.nextFollowUpDate = toDateOrNull(body.nextFollowUpDate);
  if (Object.prototype.hasOwnProperty.call(body, "followUps")) normalized.followUps = (body.followUps || []).map((item) => ({ ...item, scheduledAt: toDateOrNull(item.scheduledAt) })).sort((a, b) => a.sequence - b.sequence);
  return normalized;
};

const recordLeadAudit = async ({ lead, action, actor, context, changes = {} }) => {
  await LeadAudit.create({ leadId: lead._id, permanentLeadId: lead.permanentLeadId, action, actorUserId: actor._id, changes, ...contextFields(context) });
  await recordAudit({ action: `LEAD.${action}`, actorUserId: actor._id, targetUserId: lead.assignedTo?._id || lead.assignedTo, context, metadata: { leadId: String(lead._id), permanentLeadId: lead.permanentLeadId } });
};

const buildFilter = (query, actor) => {
  const filter = {};
  const includeDeleted = query.includeDeleted === "true" && actor.role === "ADMIN";
  if (!includeDeleted) filter.deletedAt = null;
  if (query.assignedTo) filter.assignedTo = query.assignedTo;
  if (query.salesStage) filter.salesStage = query.salesStage;
  if (query.leadPriority) filter.leadPriority = query.leadPriority;
  if (query.temperature) filter.temperature = query.temperature;
  if (query.source) filter.source = query.source;
  if (query.industry) filter.industry = query.industry;
  if (query.city) filter.city = query.city;
  if (query.country) filter.country = query.country;
  if (query.search) {
    const regex = new RegExp(escapeRegExp(query.search), "i");
    filter.$or = [
      { permanentLeadId: regex }, { companyName: regex }, { "primaryContact.fullName": regex },
      { "primaryContact.email": regex }, { "primaryContact.mobile": regex }, { industry: regex }, { subSector: regex }, { city: regex },
    ];
  }
  return filter;
};

export const listLeads = async (query, actor) => {
  const filter = buildFilter(query, actor);
  const sort = { [query.sortBy]: query.sortOrder === "asc" ? 1 : -1, _id: -1 };
  const [items, total] = await Promise.all([
    Lead.find(filter).populate("assignedTo", "userId fullName email").sort(sort).skip((query.page - 1) * query.limit).limit(query.limit).lean(),
    Lead.countDocuments(filter),
  ]);
  return { items: items.map(presentLead), meta: { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) } };
};

export const getLead = async (id) => presentLead(await requireLead(id));

export const createLead = async (body, actor, context) => {
  const assignedTo = actor.role === "ADMIN" && body.assignedTo ? body.assignedTo : actor._id;
  await requireActiveUser(assignedTo);
  const normalized = normalizeBody({ ...body, assignedTo });
  const lead = await Lead.create({ ...normalized, permanentLeadId: await nextLeadId(), createdBy: actor._id, updatedBy: actor._id });
  await recordLeadAudit({ lead, action: "CREATED", actor, context, changes: { companyName: lead.companyName, assignedTo: String(assignedTo) } });
  await lead.populate("assignedTo", "userId fullName email");
  return presentLead(lead);
};

export const updateLead = async (id, body, actor, context) => {
  const lead = await requireLead(id);
  if (!canMutate(lead, actor)) throw new AppError("You can only edit leads assigned to you", { statusCode: 403, code: "LEAD_EDIT_FORBIDDEN" });
  const previous = presentLead(lead);
  const next = { ...body };
  if (body.assignedTo) {
    if (actor.role !== "ADMIN" && String(body.assignedTo) !== String(actor._id)) throw new AppError("Only an administrator can reassign a lead", { statusCode: 403, code: "LEAD_REASSIGN_FORBIDDEN" });
    await requireActiveUser(body.assignedTo);
  }
  const normalized = normalizeBody(next);
  Object.assign(lead, normalized, { updatedBy: actor._id });
  await lead.save();
  await recordLeadAudit({ lead, action: "UPDATED", actor, context, changes: diffLead(previous, presentLead(lead)) });
  await lead.populate("assignedTo", "userId fullName email");
  return presentLead(lead);
};

export const softDeleteLead = async (id, actor, context) => {
  const lead = await requireLead(id);
  if (!canMutate(lead, actor)) throw new AppError("You can only delete leads assigned to you", { statusCode: 403, code: "LEAD_DELETE_FORBIDDEN" });
  lead.deletedAt = new Date(); lead.deletedBy = actor._id; lead.updatedBy = actor._id; await lead.save();
  await recordLeadAudit({ lead, action: "SOFT_DELETED", actor, context });
};

export const restoreLead = async (id, actor, context) => {
  const lead = await requireLead(id, { includeDeleted: true });
  if (!lead.deletedAt) return presentLead(lead);
  lead.deletedAt = null; lead.deletedBy = null; lead.updatedBy = actor._id; await lead.save();
  await recordLeadAudit({ lead, action: "RESTORED", actor, context });
  await lead.populate("assignedTo", "userId fullName email");
  return presentLead(lead);
};

export const getLeadHistory = async (id) => {
  const lead = await requireLead(id, { includeDeleted: true });
  const items = await LeadAudit.find({ leadId: lead._id }).populate("actorUserId", "userId fullName email").sort({ createdAt: -1 }).limit(100).lean();
  return items.map((item) => ({ id: String(item._id), action: item.action, changes: item.changes, actor: safeUser(item.actorUserId), createdAt: item.createdAt }));
};

export const getLeadSummary = async (query = {}) => {
  const match = { deletedAt: null };
  if (query.assignedTo) match.assignedTo = new mongoose.Types.ObjectId(query.assignedTo);
  const now = new Date();
  const [totals, sectors, dueFollowUps] = await Promise.all([
    Lead.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: 1 }, estimatedBudget: { $sum: "$estimatedBudget" }, avgIntent: { $avg: "$buyingIntentScore" }, highPriority: { $sum: { $cond: [{ $eq: ["$leadPriority", "High"] }, 1, 0] } }, hot: { $sum: { $cond: [{ $eq: ["$temperature", "Hot"] }, 1, 0] } } } }]),
    Lead.aggregate([{ $match: match }, { $group: { _id: "$industry", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 }]),
    Lead.countDocuments({ ...match, nextFollowUpDate: mongoose.trusted({ $ne: null, $lte: now }) }),
  ]);
  const row = totals[0] || {};
  return { total: row.total || 0, estimatedBudget: row.estimatedBudget || 0, averageIntentScore: Math.round(row.avgIntent || 0), highPriority: row.highPriority || 0, hot: row.hot || 0, dueFollowUps, sectors: sectors.map((item) => ({ industry: item._id || "Unspecified", count: item.count })) };
};
