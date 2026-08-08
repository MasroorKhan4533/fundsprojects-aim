import { apiClient } from "../../../services/apiClient";
const json = (body) => JSON.stringify(body);
const qs = (params = {}) => { const search = new URLSearchParams(); Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") search.set(key, String(value)); }); return search.toString(); };
export const dealsApi = {
  workbench: (params = {}) => apiClient(`/deals/workbench?${qs(params)}`),
  summary: (params = {}) => apiClient(`/deals/summary?${qs(params)}`),
  byLead: (leadId) => apiClient(`/deals/${leadId}`),
  saveC3: ({ leadId, body }) => apiClient(`/deals/${leadId}/c3`, { method: "PUT", body: json(body) }),
  saveC4: ({ leadId, body }) => apiClient(`/deals/${leadId}/c4`, { method: "PUT", body: json(body) }),
  handover: (leadId) => apiClient(`/deals/${leadId}/handover`, { method: "POST", body: "{}" }),
};
