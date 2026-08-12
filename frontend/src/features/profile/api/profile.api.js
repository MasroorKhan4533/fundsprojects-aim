import { apiClient } from "../../../services/apiClient";
export const profileApi = { me: () => apiClient("/profile/me") };
