import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
export const useMyProfile = () => useQuery({ queryKey: ["profile", "me"], queryFn: profileApi.me });
