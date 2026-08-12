import { apiClient } from "../../../services/apiClient";
export const dashboardApi = { aim: (params = {}) => { const q = new URLSearchParams(Object.entries(params).filter(([,v]) => v)); return apiClient(`/dashboard/aim?${q}`); } };
