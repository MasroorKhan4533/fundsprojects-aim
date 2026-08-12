import { apiClient } from "../../../services/apiClient";
const json = (body) => JSON.stringify(body);
const queryString = (params = {}) => {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""));
  return query.toString();
};
export const targetsApi = {
  list: (params = {}) => apiClient(`/targets?${queryString(params)}`),
  create: (body) => apiClient("/targets", { method: "POST", body: json(body) }),
  update: (id, body) => apiClient(`/targets/${id}`, { method: "PUT", body: json(body) }),
  remove: (id) => apiClient(`/targets/${id}`, { method: "DELETE" }),
};
