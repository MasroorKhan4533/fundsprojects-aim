import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import * as api from "../api/c3.api";

/*
  React Query hooks for C3.
*/

const refresh = (queryClient, leadId) => {
  queryClient.invalidateQueries({
    queryKey: ["c3"],
  });

  queryClient.invalidateQueries({
    queryKey: ["leads"],
  });

  if (leadId) {
    queryClient.invalidateQueries({
      queryKey: ["c3", leadId],
    });

    queryClient.invalidateQueries({
      queryKey: ["lead", leadId],
    });
  }
};

export const useC3Leads = () =>
  useQuery({
    queryKey: ["c3"],
    queryFn: api.getC3Leads,
  });

export const useC3Lead = (leadId) =>
  useQuery({
    queryKey: ["c3", leadId],
    queryFn: () => api.getC3Lead(leadId),
    enabled: Boolean(leadId),
  });

export const useSaveSolution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.saveSolution,
    onSuccess: (_, variables) =>
      refresh(queryClient, variables.leadId),
  });
};

export const useSaveCommercial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.saveCommercial,
    onSuccess: (_, variables) =>
      refresh(queryClient, variables.leadId),
  });
};

export const useC3Outcome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.setC3Outcome,
    onSuccess: (_, variables) =>
      refresh(queryClient, variables.leadId),
  });
};
