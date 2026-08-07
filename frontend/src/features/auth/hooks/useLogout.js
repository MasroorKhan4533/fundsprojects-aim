import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutRequest } from "../api/auth.api";

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["auth"] });
    },
  });
};
