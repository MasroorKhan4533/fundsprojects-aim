import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import * as api from "../api/handover.api";

export const useHandovers = () =>
  useQuery({
    queryKey: ["handovers"],
    queryFn: api.getHandovers,
  });

export const useCreateHandover = () => {
  const qc =
    useQueryClient();

  return useMutation({
    mutationFn:
      api.createHandover,

    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["handovers"],
      }),
  });
};

export const useUpdateHandover = () => {
  const qc =
    useQueryClient();

  return useMutation({
    mutationFn:
      api.updateHandover,

    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["handovers"],
      }),
  });
};
