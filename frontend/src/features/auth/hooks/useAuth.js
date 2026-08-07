import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../api/auth.api";

export const useAuth = () => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
