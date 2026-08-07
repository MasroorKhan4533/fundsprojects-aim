import { apiClient } from "../../../services/apiClient";

const toQuery = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.set(key, value);
    }
  });

  return params.toString();
};

export const getLeads = (filters = {}) =>
  apiClient(`/leads?${toQuery(filters)}`);

export const getDeletedLeads = () =>
  apiClient("/leads/deleted");

export const getLead = (id) =>
  apiClient(`/leads/${id}`);

export const checkDuplicates = (body) =>
  apiClient("/leads/check-duplicates", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const createLead = (body) =>
  apiClient("/leads", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateLead = ({ id, body }) =>
  apiClient(`/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const assignLead = ({ id, assignedOwnerId }) =>
  apiClient(`/leads/${id}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ assignedOwnerId }),
  });

export const deleteLead = (id) =>
  apiClient(`/leads/${id}`, {
    method: "DELETE",
  });

export const restoreLead = (id) =>
  apiClient(`/leads/${id}/restore`, {
    method: "POST",
  });

export const addComment = ({ id, comment }) =>
  apiClient(`/leads/${id}/comments`, {
    method: "POST",
    body: JSON.stringify({
      comment,
      stageContext: "A",
    }),
  });

export const addContact = ({ id, body }) =>
  apiClient(`/leads/${id}/contacts`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateContact = ({ id, contactId, body }) =>
  apiClient(`/leads/${id}/contacts/${contactId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const deleteContact = ({ id, contactId }) =>
  apiClient(`/leads/${id}/contacts/${contactId}`, {
    method: "DELETE",
  });

export const getAudits = (id) =>
  apiClient(`/leads/${id}/audits`);
