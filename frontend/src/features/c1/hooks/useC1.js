import { useQuery } from "@tanstack/react-query";
import {
  getC1Leads,
  getC1Summary,
  getTimeline,
} from "../api/c1.api";

export const useC1Leads = () =>
  useQuery({
    queryKey: ["c1"],
    queryFn: getC1Leads,
  });

export const useC1Summary = (leadId) =>
  useQuery({
    queryKey: ["c1", leadId],
    queryFn: () => getC1Summary(leadId),
    enabled: Boolean(leadId),
  });

export const useTimeline = (leadId) =>
  useQuery({
    queryKey: ["c1", leadId, "timeline"],
    queryFn: () => getTimeline(leadId),
    enabled: Boolean(leadId),
  });
