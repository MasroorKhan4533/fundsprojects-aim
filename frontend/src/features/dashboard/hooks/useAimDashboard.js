import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";
export const useAimDashboard = (params = {}) => useQuery({ queryKey: ["dashboard", "aim", params], queryFn: () => dashboardApi.aim(params) });
