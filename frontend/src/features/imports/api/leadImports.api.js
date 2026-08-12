import { apiClient } from "../../../services/apiClient";
const form = (file, assignedTo) => { const body = new FormData(); body.append("file", file); if (assignedTo) body.append("assignedTo", assignedTo); return body; };
export const leadImportsApi = {
  preview: ({ file, assignedTo }) => apiClient("/imports/leads/preview", { method: "POST", body: form(file, assignedTo), timeoutMs: 60000 }),
  commit: ({ file, assignedTo }) => apiClient("/imports/leads/commit", { method: "POST", body: form(file, assignedTo), timeoutMs: 120000 }),
};
