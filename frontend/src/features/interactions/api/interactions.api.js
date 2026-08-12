import { apiClient } from "../../../services/apiClient";
const json = (body) => JSON.stringify(body);
const qs = (params = {}) => { const search = new URLSearchParams(); Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") search.set(key, String(value)); }); return search.toString(); };
export const interactionsApi = {
  list: (params = {}) => apiClient(`/interactions?${qs(params)}`),
  summary: (params = {}) => apiClient(`/interactions/summary?${qs(params)}`),
  journey: (leadId) => apiClient(`/interactions/journey/${leadId}`),
  create: (body) => apiClient("/interactions", { method: "POST", body: json(body) }),
};
