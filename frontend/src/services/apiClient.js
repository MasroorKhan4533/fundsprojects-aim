import { env } from "../config/env";

export class ApiError extends Error {
  constructor(message, { status = 0, code = "API_ERROR", details = null, requestId = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (response.status === 204) return null;
  if (contentType.includes("application/json")) return response.json();
  return response.text();
};

const rawRequest = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);
  try {
    const headers = new Headers(options.headers || {});
    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const response = await fetch(`${env.apiUrl}${endpoint}`, {
      ...options,
      credentials: "include",
      headers,
      signal: options.signal ?? controller.signal,
    });
    const payload = await parseResponse(response);
    return { response, payload };
  } finally {
    clearTimeout(timeout);
  }
};

let refreshPromise = null;
const attemptRefresh = () => {
  if (!refreshPromise) {
    refreshPromise = rawRequest("/auth/refresh", { method: "POST", body: JSON.stringify({}) })
      .then(({ response }) => response.ok)
      .catch(() => false)
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
};

export const apiClient = async (endpoint, options = {}) => {
  try {
    let { response, payload } = await rawRequest(endpoint, options);
    if (response.status === 401 && !options.skipAuthRefresh && endpoint !== "/auth/refresh") {
      const refreshed = await attemptRefresh();
      if (refreshed) ({ response, payload } = await rawRequest(endpoint, { ...options, skipAuthRefresh: true }));
    }

    if (!response.ok) {
      throw new ApiError(payload?.message || `Request failed with status ${response.status}`, {
        status: response.status,
        code: payload?.code || "API_ERROR",
        details: payload?.details,
        requestId: payload?.requestId || response.headers.get("x-request-id"),
      });
    }
    return payload;
  } catch (error) {
    if (error?.name === "AbortError") throw new ApiError("Request timed out", { code: "REQUEST_TIMEOUT" });
    if (error instanceof ApiError) throw error;
    throw new ApiError("Unable to reach the API", { code: "NETWORK_ERROR" });
  }
};
