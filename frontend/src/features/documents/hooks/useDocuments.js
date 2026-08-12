import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "../api/documents.api";
export const useLeadDocuments = (leadId) => useQuery({ queryKey: ["documents", leadId], queryFn: () => documentsApi.list(leadId), enabled: Boolean(leadId) });
export const useUploadDocument = () => { const client = useQueryClient(); return useMutation({ mutationFn: documentsApi.upload, onSuccess: (_r, input) => client.invalidateQueries({ queryKey: ["documents", input.leadId] }) }); };
export const useDeleteDocument = (leadId) => { const client = useQueryClient(); return useMutation({ mutationFn: documentsApi.remove, onSuccess: () => client.invalidateQueries({ queryKey: ["documents", leadId] }) }); };
