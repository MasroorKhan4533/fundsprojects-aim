import { apiClient } from "../../../services/apiClient";

/*
  C2 API layer.
  Components never call fetch directly.
*/

export const getC2Leads = () =>
  apiClient("/c2");

export const getC2Lead = (leadId) =>
  apiClient(`/c2/${leadId}`);

export const saveC2Profile = ({ leadId, body }) =>
  apiClient(`/c2/${leadId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const setC2Outcome = ({ leadId, body }) =>
  apiClient(`/c2/${leadId}/outcome`, {
    method: "POST",
    body: JSON.stringify(body),
  });
