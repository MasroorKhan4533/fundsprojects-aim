import { useQuery } from "@tanstack/react-query";
import { getSystemReadiness } from "../api/system.api";

export const useSystemHealth = () =>
  useQuery({
    queryKey: ["system", "health", "ready"],
    queryFn: getSystemReadiness,
    refetchInterval: 30_000,
  });
