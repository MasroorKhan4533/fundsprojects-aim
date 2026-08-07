import { apiClient } from "../../../services/apiClient";

export const getTargets = () =>
  apiClient("/targets");

export const saveTarget = (body) =>
  apiClient("/targets", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const deleteTarget = (id) =>
  apiClient(`/targets/${id}`, {
    method: "DELETE",
  });
