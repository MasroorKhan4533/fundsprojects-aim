import { useMutation, useQuery } from "@tanstack/react-query";
import { integrationsApi } from "../api/integrations.api";
export const useIntegrationCapabilities = () => useQuery({ queryKey: ["integrations", "capabilities"], queryFn: integrationsApi.capabilities });
export const useLaunchIntegration = () => useMutation({ mutationFn: integrationsApi.launch });
