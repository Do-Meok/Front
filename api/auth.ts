import {
  LoginForm,
  TokenRefreshResponse,
} from "@/types";
import { getSecureStore } from "@/utils/secureStore";
import { clearStoredTokens } from "./authRefresh";
import axiosInstance, { PREFIX } from "./axios";

// 로그인
async function login(body: LoginForm): Promise<TokenRefreshResponse> {
  const { data } = await axiosInstance.post<TokenRefreshResponse>(
    `${PREFIX}/auth/log-in`,
    body
  );

  return data;
}

/** 로그아웃: 서버에 refresh_token 전달 후 저장된 토큰 삭제 + axios 헤더 제거 */
async function logout(): Promise<void> {
  const refreshToken = await getSecureStore("refreshToken");
  try {
    await axiosInstance.post(`${PREFIX}/auth/log-out`, {
      refresh_token: refreshToken ?? undefined,
    });
  } catch {
    // 422 등 API 실패해도 클라이언트에서는 항상 로그아웃 처리
  }
  await clearStoredTokens();
  delete axiosInstance.defaults.headers.common["Authorization"];
}

/** 토큰 재발급 */
async function refreshToken(): Promise<TokenRefreshResponse> {
  const storedRefresh = await getSecureStore("refreshToken");
  const { data } = await axiosInstance.post<TokenRefreshResponse>(
    `${PREFIX}/auth/refresh`,
    { refresh_token: storedRefresh }
  );

  return data;
}



export {
  login,
  logout,
  refreshToken
};

