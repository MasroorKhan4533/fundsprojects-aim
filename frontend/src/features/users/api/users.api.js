import { apiClient } from "../../../services/apiClient";

export const getUsers = () =>
  apiClient("/users");
