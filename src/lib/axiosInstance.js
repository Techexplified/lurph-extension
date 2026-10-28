import axios from "axios";
import { clearTokens, getTokens, setTokens } from "./tokenStorage.js";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"
).replace(/\/$/, "");
const baseURL = API_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise = null;

axiosInstance.interceptors.request.use(async (config) => {
  // The refresh request uses the refresh token in its body and must not recurse.
  if (config.url?.endsWith("/api/auth/refresh")) return config;
  const tokens = await getTokens();
  if (tokens?.accessToken)
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshRequest =
      originalRequest?.url?.endsWith("/api/auth/refresh");
    const isAuthRequest =
      /\/api\/auth\/(login|register|google\/exchange)$/.test(
        originalRequest?.url || "",
      );

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retried ||
      isRefreshRequest ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retried = true;
    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const tokens = await getTokens();
          if (!tokens?.refreshToken)
            throw new Error("No refresh token available");
          const response = await axios.post(
            `${baseURL}/api/auth/refresh`,
            { refreshToken: tokens.refreshToken },
            { timeout: 15000 },
          );
          await setTokens(response.data.tokens);
          return response.data.tokens;
        })().finally(() => {
          refreshPromise = null;
        });
      }

      const tokens = await refreshPromise;
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      await clearTokens();
      return Promise.reject(refreshError);
    }
  },
);

export default axiosInstance;
