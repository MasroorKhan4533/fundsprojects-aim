import { sendSuccess } from "../../core/http/response.js";
import { commitLeadImport, previewLeadImport } from "./lead-import.service.js";
const contextFrom = (req) => ({ requestId: req.requestId, ip: req.ip, userAgent: req.get("user-agent") || "" });
const ownerFrom = (req) => req.body?.assignedTo || String(req.user._id);
export const previewLeadImportController = async (req, res) => sendSuccess(res, { data: { preview: await previewLeadImport({ file: req.file, assignedTo: ownerFrom(req) }) } });
export const commitLeadImportController = async (req, res) => sendSuccess(res, { statusCode: 201, message: "Lead import completed", data: { result: await commitLeadImport({ file: req.file, assignedTo: ownerFrom(req) }, req.user, contextFrom(req)) } });
