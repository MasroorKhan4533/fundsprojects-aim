import { apiClient } from "../../../services/apiClient";

export const getC1Leads = () =>
  apiClient("/c1");

export const getC1Summary = (leadId) =>
  apiClient(`/c1/${leadId}`);

export const getTimeline = (leadId) =>
  apiClient(`/c1/${leadId}/timeline/all`);
