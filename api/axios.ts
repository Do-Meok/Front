import { getSecureStore } from "@/utils/secureStore";
import axios from "axios";

const API_URL = "https://domeok.augustzero.duckdns.org";

export const PREFIX = "/api/v1";

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

// 응답 인터셉터: 401 에러 처리
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰이 만료되었거나 유효하지 않은 경우
      // 필요시 여기서 토큰 갱신 로직 추가 가능
    }
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
