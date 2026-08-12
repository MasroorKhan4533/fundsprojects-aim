import { sendSuccess } from "../../core/http/response.js";
import { deleteDocument, getDocumentDownload, listLeadDocuments, uploadLeadDocument } from "./document.service.js";
const contextFrom = (req) => ({ requestId: req.requestId, ip: req.ip, userAgent: req.get("user-agent") || "" });
export const listLeadDocumentsController = async (req, res) => sendSuccess(res, { data: { documents: await listLeadDocuments(req.validated.params.leadId, req.user) } });
export const uploadLeadDocumentController = async (req, res) => sendSuccess(res, { statusCode: 201, message: "Document uploaded", data: { document: await uploadLeadDocument({ leadId: req.validated.params.leadId, category: req.validated.body.category, file: req.file }, req.user, contextFrom(req)) } });
export const downloadDocumentController = async (req, res) => { const { meta, buffer } = await getDocumentDownload(req.validated.params.id, req.user); res.setHeader("Content-Type", meta.mimeType); res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(meta.originalName)}`); res.setHeader("Cache-Control", "private, no-store"); return res.status(200).send(buffer); };
export const deleteDocumentController = async (req, res) => { await deleteDocument(req.validated.params.id, req.user, contextFrom(req)); return sendSuccess(res, { message: "Document deleted" }); };
