import { useQuery } from "@tanstack/react-query";

import {
  getPerformance,
} from "../api/performance.api";

export const usePerformance = () =>
  useQuery({
    queryKey: ["performance"],
    queryFn: getPerformance,
  });
