import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../api/users.api";

export const useUsers = (enabled = true) =>
  useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled,
  });
