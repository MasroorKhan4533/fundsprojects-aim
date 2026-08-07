import { apiClient } from "../../../services/apiClient";

// All authentication API calls stay outside React components.
export const loginRequest = (credentials) =>
  apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const getCurrentUser = () =>
  apiClient("/auth/me");

export const logoutRequest = () =>
  apiClient("/auth/logout", {
    method: "POST",
  });
