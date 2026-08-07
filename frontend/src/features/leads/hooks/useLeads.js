import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import * as api from "../api/leads.api";

const refresh = (queryClient, id) => {
  queryClient.invalidateQueries({
    queryKey: ["leads"],
  });

  if (id) {
    queryClient.invalidateQueries({
      queryKey: ["lead", id],
    });
  }
};

export const useLeads = (filters) =>
  useQuery({
    queryKey: ["leads", filters],
    queryFn: () => api.getLeads(filters),
  });

export const useDeletedLeads = (enabled) =>
  useQuery({
    queryKey: ["leads", "deleted"],
    queryFn: api.getDeletedLeads,
    enabled,
  });

export const useLead = (id) =>
  useQuery({
    queryKey: ["lead", id],
    queryFn: () => api.getLead(id),
    enabled: Boolean(id),
  });

export const useAudits = (id, enabled) =>
  useQuery({
    queryKey: ["lead", id, "audits"],
    queryFn: () => api.getAudits(id),
    enabled: Boolean(id) && enabled,
  });

export const useDuplicateCheck = () =>
  useMutation({
    mutationFn: api.checkDuplicates,
  });

export const useCreateLead = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.createLead,
    onSuccess: () => refresh(qc),
  });
};

export const useUpdateLead = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.updateLead,
    onSuccess: (_, v) => refresh(qc, v.id),
  });
};

export const useAssignLead = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.assignLead,
    onSuccess: (_, v) => refresh(qc, v.id),
  });
};

export const useDeleteLead = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.deleteLead,
    onSuccess: () => refresh(qc),
  });
};

export const useRestoreLead = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.restoreLead,
    onSuccess: () => refresh(qc),
  });
};

export const useAddComment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.addComment,
    onSuccess: (_, v) => refresh(qc, v.id),
  });
};

export const useAddContact = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.addContact,
    onSuccess: (_, v) => refresh(qc, v.id),
  });
};

export const useUpdateContact = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.updateContact,
    onSuccess: (_, v) => refresh(qc, v.id),
  });
};

export const useDeleteContact = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.deleteContact,
    onSuccess: (_, v) => refresh(qc, v.id),
  });
};
