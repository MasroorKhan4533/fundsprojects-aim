import { sendSuccess } from "../../core/http/response.js";
import { createInteraction, getInteractionSummary, getJourney, listInteractions } from "./interaction.service.js";
const contextFrom = (req) => ({ requestId: req.requestId, ip: req.ip, userAgent: req.get("user-agent") || "" });
export const createInteractionController = async (req, res) => sendSuccess(res, { statusCode: 201, message: "C1/C2 interaction recorded", data: { interaction: await createInteraction(req.validated.body, req.user, contextFrom(req)) } });
export const listInteractionsController = async (req, res) => { const result = await listInteractions(req.validated.query, req.user); return sendSuccess(res, { data: result.items, meta: result.meta }); };
export const interactionSummaryController = async (req, res) => sendSuccess(res, { data: { summary: await getInteractionSummary(req.validated.query, req.user) } });
export const journeyController = async (req, res) => sendSuccess(res, { data: { journey: await getJourney(req.validated.params.leadId, req.user) } });
