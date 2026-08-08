import { AppError } from "../../core/errors/app-error.js";
import { recordAudit } from "../audit/audit.service.js";
import Lead from "../leads/lead.model.js";
import Document from "./document.model.js";
import { storageProvider } from "./storage/index.js";

const canAccess = (lead, actor) => actor.role === "ADMIN" || String(lead.assignedTo) === String(actor._id);
const requireLeadAccess = async (leadId, actor) => {
  const lead = await Lead.findOne({ _id: leadId, deletedAt: null }).select("permanentLeadId assignedTo companyName").lean();
  if (!lead) throw new AppError("Lead not found", { statusCode: 404, code: "LEAD_NOT_FOUND" });
  if (!canAccess(lead, actor)) throw new AppError("You do not have access to this lead's documents", { statusCode: 403, code: "DOCUMENT_FORBIDDEN" });
  return lead;
};
const present = (item) => ({ id: String(item._id), leadId: String(item.leadId), permanentLeadId: item.permanentLeadId, category: item.category, originalName: item.originalName, mimeType: item.mimeType, size: item.size, uploadedBy: item.uploadedBy && typeof item.uploadedBy === "object" ? { id: String(item.uploadedBy._id), userId: item.uploadedBy.userId, fullName: item.uploadedBy.fullName } : null, createdAt: item.createdAt });

export const listLeadDocuments = async (leadId, actor) => {
  await requireLeadAccess(leadId, actor);
  const rows = await Document.find({ leadId }).populate("uploadedBy", "userId fullName").sort({ createdAt: -1 }).lean();
  return rows.map(present);
};

export const uploadLeadDocument = async ({ leadId, category, file }, actor, context) => {
  if (!file) throw new AppError("Choose a file to upload", { statusCode: 400, code: "DOCUMENT_FILE_REQUIRED" });
  const lead = await requireLeadAccess(leadId, actor);
  const storageKey = await storageProvider.save(file);
  try {
    const row = await Document.create({ leadId, permanentLeadId: lead.permanentLeadId, category, originalName: file.originalname, storageKey, mimeType: file.mimetype, size: file.size, uploadedBy: actor._id });
    await recordAudit({ action: "DOCUMENT.UPLOADED", actorUserId: actor._id, targetUserId: lead.assignedTo, context, metadata: { documentId: String(row._id), leadId, permanentLeadId: lead.permanentLeadId, category, size: file.size } });
    await row.populate("uploadedBy", "userId fullName");
    return present(row);
  } catch (error) { await storageProvider.remove(storageKey); throw error; }
};

export const getDocumentDownload = async (id, actor) => {
  const row = await Document.findById(id).lean();
  if (!row) throw new AppError("Document not found", { statusCode: 404, code: "DOCUMENT_NOT_FOUND" });
  await requireLeadAccess(String(row.leadId), actor);
  return { meta: row, buffer: await storageProvider.read(row.storageKey) };
};

export const deleteDocument = async (id, actor, context) => {
  const row = await Document.findById(id);
  if (!row) throw new AppError("Document not found", { statusCode: 404, code: "DOCUMENT_NOT_FOUND" });
  const lead = await requireLeadAccess(String(row.leadId), actor);
  await row.deleteOne();
  await storageProvider.remove(row.storageKey);
  await recordAudit({ action: "DOCUMENT.DELETED", actorUserId: actor._id, targetUserId: lead.assignedTo, context, metadata: { documentId: id, leadId: String(row.leadId), permanentLeadId: row.permanentLeadId } });
};
