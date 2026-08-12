import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leadImportsApi } from "../api/leadImports.api";
export const useLeadImportPreview = () => useMutation({ mutationFn: leadImportsApi.preview });
export const useLeadImportCommit = () => { const client = useQueryClient(); return useMutation({ mutationFn: leadImportsApi.commit, onSuccess: () => { client.invalidateQueries({ queryKey: ["leads"] }); client.invalidateQueries({ queryKey: ["dashboard"] }); } }); };
