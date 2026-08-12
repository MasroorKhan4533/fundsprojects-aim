import { apiClient } from "../../../services/apiClient";
export const integrationsApi = { capabilities: () => apiClient("/integrations/capabilities"), launch: ({ leadId, channel, subject = "", message = "" }) => apiClient(`/integrations/leads/${leadId}/launch`, { method: "POST", body: JSON.stringify({ channel, subject, message }) }) };
