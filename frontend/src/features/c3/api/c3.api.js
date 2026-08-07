import { apiClient } from "../../../services/apiClient";

/*
  C3 API layer:
  solution versions + proposal + quotation + negotiation.
*/

export const getC3Leads = () =>
  apiClient("/c3");

export const getC3Lead = (leadId) =>
  apiClient(`/c3/${leadId}`);

export const saveSolution = ({ leadId, body }) =>
  apiClient(`/c3/${leadId}/solutions`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const saveCommercial = ({ leadId, body }) =>
  apiClient(`/c3/${leadId}/commercial`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const setC3Outcome = ({ leadId, body }) =>
  apiClient(`/c3/${leadId}/outcome`, {
    method: "POST",
    body: JSON.stringify(body),
  });
