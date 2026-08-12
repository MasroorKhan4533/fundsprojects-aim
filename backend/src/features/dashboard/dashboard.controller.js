import { sendSuccess } from "../../core/http/response.js";
import { getAimDashboard } from "./dashboard.service.js";
export const getAimDashboardController = async (req, res) => sendSuccess(res, { data: await getAimDashboard(req.validated.query, req.user) });
