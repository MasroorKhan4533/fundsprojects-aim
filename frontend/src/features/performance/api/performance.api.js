import { apiClient } from "../../../services/apiClient";

export const getPerformance = () =>
  apiClient("/performance");
