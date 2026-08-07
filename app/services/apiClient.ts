import axios from "axios";

const RETRYABLE_METHODS = new Set(["get", "head", "options"]);
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const MAX_GET_RETRIES = 2;
const RETRY_DELAYS_MS = [1500, 3500];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableApiError = (error: any) => {
  const config = error.config || {};
  const method = String(config.method || "get").toLowerCase();

  if (!RETRYABLE_METHODS.has(method)) {
    return false;
  }

  if (config.__skipRetry) {
    return false;
  }

  const status = error.response?.status;
  return (
    error.code === "ECONNABORTED" ||
    error.code === "ERR_NETWORK" ||
    !error.response ||
    RETRYABLE_STATUS_CODES.has(status)
  );
};

/** Same-origin BFF proxy — injects httpOnly session JWT as Bearer on the server. */
export const apiClient = axios.create({
  baseURL: "/api/proxy",
  timeout: 75000,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    config.__retryCount = config.__retryCount || 0;

    if (isRetryableApiError(error) && config.__retryCount < MAX_GET_RETRIES) {
      config.__retryCount += 1;
      await wait(RETRY_DELAYS_MS[config.__retryCount - 1] || 3500);
      return apiClient(config);
    }

    if (error.response?.status === 401 && typeof window !== "undefined") {
      const url = String(config.url || "");
      const isAuthProbe =
        url.includes("/auth/login") ||
        url.includes("/auth/signup") ||
        url.includes("/auth/forgot-password");

      if (!isAuthProbe && !config.__skipAuthRedirect) {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        // Do not clear cart
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
        } catch {
          // ignore
        }

        const path = window.location.pathname;
        if (path.startsWith("/admin")) {
          window.location.href = "/admin/login";
        } else if (path.startsWith("/account")) {
          window.location.href = "/";
        }
      }
    }

    return Promise.reject(error);
  }
);

export const warmUpApi = async () => {
  const response = await apiClient.get("/api/v1/health", {
    timeout: 75000,
  });
  return response.data;
};

export default apiClient;
