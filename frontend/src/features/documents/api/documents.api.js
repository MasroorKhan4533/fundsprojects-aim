import { env } from "../../../config/env";
import { apiClient } from "../../../services/apiClient";
export const documentsApi = {
  list: (leadId) => apiClient(`/documents/leads/${leadId}`),
  upload: ({ leadId, file, category }) => { const body = new FormData(); body.append("file", file); body.append("category", category); return apiClient(`/documents/leads/${leadId}`, { method: "POST", body, timeoutMs: 60000 }); },
  remove: (id) => apiClient(`/documents/${id}`, { method: "DELETE" }),
  downloadUrl: (id) => `${env.apiUrl}/documents/${id}/download`,
};
