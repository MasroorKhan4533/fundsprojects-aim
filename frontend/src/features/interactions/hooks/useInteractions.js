import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { interactionsApi } from "../api/interactions.api";
export const interactionKeys = { all: ["interactions"], list: (params) => ["interactions", "list", params], summary: (params) => ["interactions", "summary", params], journey: (leadId) => ["interactions", "journey", leadId] };
export const useInteractions = (params = {}) => useQuery({ queryKey: interactionKeys.list(params), queryFn: () => interactionsApi.list(params), placeholderData: (previous) => previous });
export const useInteractionSummary = (params = {}) => useQuery({ queryKey: interactionKeys.summary(params), queryFn: () => interactionsApi.summary(params) });
export const useJourney = (leadId, options = {}) => useQuery({ queryKey: interactionKeys.journey(leadId), queryFn: () => interactionsApi.journey(leadId), enabled: Boolean(leadId), ...options });
export const useCreateInteraction = () => { const client = useQueryClient(); return useMutation({ mutationFn: interactionsApi.create, onSuccess: (_data, body) => { client.invalidateQueries({ queryKey: interactionKeys.all }); client.invalidateQueries({ queryKey: ["leads"] }); client.invalidateQueries({ queryKey: ["dashboard"] }); if (body?.leadId) client.invalidateQueries({ queryKey: interactionKeys.journey(body.leadId) }); } }); };
