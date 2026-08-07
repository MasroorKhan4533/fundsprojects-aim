import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginRequest } from "../api/auth.api";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], data);
    },
  });
};
