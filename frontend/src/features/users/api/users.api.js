import { apiClient } from "../../../services/apiClient";
const json = (body) => JSON.stringify(body);
export const usersApi = {
  list: (params = {}) => apiClient(`/users?${new URLSearchParams(params)}`),
  review: (id, body) => apiClient(`/users/${id}/approval`, { method: "PATCH", body: json(body) }),
  resendActivation: (id) => apiClient(`/users/${id}/resend-activation`, { method: "POST", body: json({}) }),
  sendPasswordReset: (id) => apiClient(`/users/${id}/send-password-reset`, { method: "POST", body: json({}) }),
  changeRole: (id, role) => apiClient(`/users/${id}/role`, { method: "PATCH", body: json({ role }) }),
  changeStatus: (id, status) => apiClient(`/users/${id}/status`, { method: "PATCH", body: json({ status }) }),
};
