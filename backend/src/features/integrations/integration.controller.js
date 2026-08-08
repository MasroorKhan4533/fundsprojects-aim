import { sendSuccess } from "../../core/http/response.js";
import { getIntegrationCapabilities, launchLeadIntegration } from "./integration.service.js";
const contextFrom = (req) => ({ requestId: req.requestId, ip: req.ip, userAgent: req.get("user-agent") || "" });
export const capabilitiesController = async (_req, res) => sendSuccess(res, { data: { capabilities: getIntegrationCapabilities() } });
export const launchController = async (req, res) => sendSuccess(res, { data: { launch: await launchLeadIntegration({ leadId: req.validated.params.leadId, ...req.validated.body }, req.user, contextFrom(req)) } });
