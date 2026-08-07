import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import * as api from "../api/c4.api";

/*
  React Query hooks for C4 and Won deals.
*/

const refresh = (queryClient, leadId) => {
  queryClient.invalidateQueries({
    queryKey: ["c4"],
  });

  queryClient.invalidateQueries({
    queryKey: ["won-deals"],
  });

  queryClient.invalidateQueries({
    queryKey: ["leads"],
  });

  if (leadId) {
    queryClient.invalidateQueries({
      queryKey: ["c4", leadId],
    });

    queryClient.invalidateQueries({
      queryKey: ["lead", leadId],
    });
  }
};

export const useC4Leads = () =>
  useQuery({
    queryKey: ["c4"],
    queryFn: api.getC4Leads,
  });

export const useC4Lead = (leadId) =>
  useQuery({
    queryKey: ["c4", leadId],
    queryFn: () => api.getC4Lead(leadId),
    enabled: Boolean(leadId),
  });

export const useWonDeals = () =>
  useQuery({
    queryKey: ["won-deals"],
    queryFn: api.getWonDeals,
  });

export const useSaveClosure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.saveClosure,
    onSuccess: (_, variables) =>
      refresh(queryClient, variables.leadId),
  });
};

export const useC4Outcome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.setC4Outcome,
    onSuccess: (_, variables) =>
      refresh(queryClient, variables.leadId),
  });
};
