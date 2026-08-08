import { apiClient } from "../../../services/apiClient";
const json = (body) => JSON.stringify(body);
const qs = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") search.set(key, String(value)); });
  return search.toString();
};
export const leadsApi = {
  list: (params = {}) => apiClient(`/leads?${qs(params)}`),
  summary: (params = {}) => apiClient(`/leads/summary?${qs(params)}`),
  get: (id) => apiClient(`/leads/${id}`),
  create: (body) => apiClient("/leads", { method: "POST", body: json(body) }),
  update: (id, body) => apiClient(`/leads/${id}`, { method: "PATCH", body: json(body) }),
  remove: (id) => apiClient(`/leads/${id}`, { method: "DELETE" }),
  restore: (id) => apiClient(`/leads/${id}/restore`, { method: "POST", body: json({}) }),
  history: (id) => apiClient(`/leads/${id}/history`),
};
