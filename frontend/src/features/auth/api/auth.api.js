import { apiClient } from "../../../services/apiClient";
const json = (body) => JSON.stringify(body);
export const authApi = {
  register: (body) => apiClient("/auth/register", { method: "POST", body: json(body), skipAuthRefresh: true }),
  login: (body) => apiClient("/auth/login", { method: "POST", body: json(body), skipAuthRefresh: true }),
  me: () => apiClient("/auth/me"),
  logout: () => apiClient("/auth/logout", { method: "POST", body: json({}), skipAuthRefresh: true }),
  logoutAll: () => apiClient("/auth/logout-all", { method: "POST", body: json({}), skipAuthRefresh: true }),
  activate: (body) => apiClient("/auth/activate", { method: "POST", body: json(body), skipAuthRefresh: true }),
  forgotPassword: (body) => apiClient("/auth/forgot-password", { method: "POST", body: json(body), skipAuthRefresh: true }),
  resetPassword: (body) => apiClient("/auth/reset-password", { method: "POST", body: json(body), skipAuthRefresh: true }),
};
