import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "../api/leads.api";
export const leadKeys = {
  all: ["leads"],
  list: (params) => ["leads", "list", params],
  summary: (params) => ["leads", "summary", params],
  detail: (id) => ["leads", "detail", id],
  history: (id) => ["leads", "history", id],
};
export const useLeads = (params) => useQuery({ queryKey: leadKeys.list(params), queryFn: () => leadsApi.list(params), placeholderData: (previous) => previous });
export const useLeadSummary = (params = {}) => useQuery({ queryKey: leadKeys.summary(params), queryFn: () => leadsApi.summary(params) });
export const useLead = (id, options = {}) => useQuery({ queryKey: leadKeys.detail(id), queryFn: () => leadsApi.get(id), enabled: Boolean(id), ...options });
export const useLeadHistory = (id, options = {}) => useQuery({ queryKey: leadKeys.history(id), queryFn: () => leadsApi.history(id), enabled: Boolean(id), ...options });
const useRefresh = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: leadKeys.all });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  } });
};
export const useCreateLead = () => useRefresh(leadsApi.create);
export const useUpdateLead = () => useRefresh(({ id, body }) => leadsApi.update(id, body));
export const useDeleteLead = () => useRefresh(leadsApi.remove);
export const useRestoreLead = () => useRefresh(leadsApi.restore);
