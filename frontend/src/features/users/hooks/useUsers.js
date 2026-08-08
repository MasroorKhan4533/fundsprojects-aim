import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/users.api";

const usersKey = ["users"];
export const useUsers = (params, options = {}) => useQuery({ queryKey: [...usersKey, params], queryFn: () => usersApi.list(params), ...options });

const useInvalidatingMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => queryClient.invalidateQueries({ queryKey: usersKey }) });
};

export const useReviewUser = () => useInvalidatingMutation(({ id, body }) => usersApi.review(id, body));
export const useResendActivation = () => useInvalidatingMutation((id) => usersApi.resendActivation(id));
export const useSendPasswordReset = () => useInvalidatingMutation((id) => usersApi.sendPasswordReset(id));
export const useChangeRole = () => useInvalidatingMutation(({ id, role }) => usersApi.changeRole(id, role));
export const useChangeStatus = () => useInvalidatingMutation(({ id, status }) => usersApi.changeStatus(id, status));
