import { apiClient } from "../../../services/apiClient";

export const getSystemReadiness = () => apiClient("/health/ready");
