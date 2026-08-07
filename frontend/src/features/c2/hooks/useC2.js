import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import * as api from "../api/c2.api";

/*
  React Query keeps C2 server data synchronized with the UI.
*/

const refresh = (queryClient, leadId) => {
  queryClient.invalidateQueries({
    queryKey: ["c2"],
  });

  queryClient.invalidateQueries({
    queryKey: ["leads"],
  });

  if (leadId) {
    queryClient.invalidateQueries({
      queryKey: ["c2", leadId],
    });

    queryClient.invalidateQueries({
      queryKey: ["lead", leadId],
    });
  }
};

export const useC2Leads = () =>
  useQuery({
    queryKey: ["c2"],
    queryFn: api.getC2Leads,
  });

export const useC2Lead = (leadId) =>
  useQuery({
    queryKey: ["c2", leadId],
    queryFn: () => api.getC2Lead(leadId),
    enabled: Boolean(leadId),
  });

export const useSaveC2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.saveC2Profile,
    onSuccess: (_, variables) =>
      refresh(queryClient, variables.leadId),
  });
};

export const useC2Outcome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.setC2Outcome,
    onSuccess: (_, variables) =>
      refresh(queryClient, variables.leadId),
  });
};
