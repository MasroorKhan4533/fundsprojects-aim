import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";

export const authKeys = { me: ["auth", "me"] };

export const useCurrentUser = (options = {}) => useQuery({
  queryKey: authKeys.me,
  queryFn: async () => (await authApi.me()).data.user,
  retry: false,
  staleTime: 60_000,
  ...options,
});

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => queryClient.setQueryData(authKeys.me, response.data.user),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => queryClient.removeQueries({ queryKey: authKeys.me }),
  });
};

export const useRegister = () => useMutation({ mutationFn: authApi.register });
export const useActivate = () => useMutation({ mutationFn: authApi.activate });
export const useForgotPassword = () => useMutation({ mutationFn: authApi.forgotPassword });
export const useResetPassword = () => useMutation({ mutationFn: authApi.resetPassword });
