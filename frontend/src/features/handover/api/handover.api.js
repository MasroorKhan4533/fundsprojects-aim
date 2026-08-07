import { apiClient } from "../../../services/apiClient";

export const getHandovers = () =>
  apiClient("/handovers");

export const createHandover = (leadId) =>
  apiClient(`/handovers/from-lead/${leadId}`, {
    method: "POST",
  });

export const updateHandover = ({
  id,
  body,
}) =>
  apiClient(`/handovers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
