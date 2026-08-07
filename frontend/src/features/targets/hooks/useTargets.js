import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import * as api from "../api/targets.api";

export const useTargets = () =>
  useQuery({
    queryKey: ["targets"],
    queryFn: api.getTargets,
  });

export const useSaveTarget = () => {
  const qc =
    useQueryClient();

  return useMutation({
    mutationFn:
      api.saveTarget,

    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["targets"],
      }),
  });
};

export const useDeleteTarget = () => {
  const qc =
    useQueryClient();

  return useMutation({
    mutationFn:
      api.deleteTarget,

    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["targets"],
      }),
  });
};
