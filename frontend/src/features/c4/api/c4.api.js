import { apiClient } from "../../../services/apiClient";

/*
  C4 API layer:
  agreement, NDA, PO, advance and final closure.
*/

export const getC4Leads = () =>
  apiClient("/c4");

export const getC4Lead = (leadId) =>
  apiClient(`/c4/${leadId}`);

export const saveClosure = ({ leadId, body }) =>
  apiClient(`/c4/${leadId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const setC4Outcome = ({ leadId, body }) =>
  apiClient(`/c4/${leadId}/outcome`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const getWonDeals = () =>
  apiClient("/leads?stage=WON&limit=100");
