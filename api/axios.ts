import { clearStoredTokens, refreshAccessToken } from "@/api/authRefresh";
import { getSecureStore } from "@/utils/secureStore";
import axios from "axios";
import { router } from "expo-router";
import { API_URL, PREFIX } from "./config";

export { API_URL, PREFIX };

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// 요청 인터셉터: 모든 요청에 토큰 추가
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getSecureStore("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401/토큰 만료 시 갱신 시도 → 실패 시 로그아웃 후 로그인 화면으로
let isRefreshing = false;
let failedQueue: {
  resolve: (value: string | null) => void;
  reject: (err: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => (token ? prom.resolve(token) : prom.reject(error)));
  failedQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isTokenError =
      status === 401 ||
      (status === 500 &&
        /토큰|token|expired|만료/i.test(
          String(error.response?.data?.message ?? error.response?.data?.detail ?? "")
        ));

    if (!isTokenError || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 리프레시 토큰이 없으면 갱신 불가 → 토큰 삭제 후 로그인 화면으로
    const hasRefreshToken = await getSecureStore("refreshToken");
    if (!hasRefreshToken) {
      await clearStoredTokens();
      delete axiosInstance.defaults.headers.common["Authorization"];
      router.replace("/auth");
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // 이미 갱신 중이면 대기 후 새 토큰으로 재요청
      return new Promise<string | null>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          }
          return Promise.reject(error);
        })
        .catch(() => Promise.reject(error));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const newToken = await refreshAccessToken();
    isRefreshing = false;
    processQueue(error, newToken);

    if (newToken) {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    }

    await clearStoredTokens();
    delete axiosInstance.defaults.headers.common["Authorization"];
    router.replace("/auth");
    return Promise.reject(error);
  }
);

// 앱 시작 시 저장된 토큰 불러오기
(async () => {
  const token = await getSecureStore("accessToken");
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
})();

export default axiosInstance;
