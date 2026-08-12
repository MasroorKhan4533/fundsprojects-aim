import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { targetsApi } from "../api/targets.api";
export const targetKeys = { all: ["targets"], list: (params) => ["targets", "list", params] };
export const useTargets = (params) => useQuery({ queryKey: targetKeys.list(params), queryFn: () => targetsApi.list(params) });
const useRefresh = (mutationFn) => { const queryClient = useQueryClient(); return useMutation({ mutationFn, onSuccess: () => { queryClient.invalidateQueries({ queryKey: targetKeys.all }); queryClient.invalidateQueries({ queryKey: ["dashboard"] }); } }); };
export const useCreateTarget = () => useRefresh(targetsApi.create);
export const useUpdateTarget = () => useRefresh(({ id, body }) => targetsApi.update(id, body));
export const useDeleteTarget = () => useRefresh(targetsApi.remove);
