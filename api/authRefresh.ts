/**
 * 토큰 갱신/삭제만 담당 (axios 인터셉터에서 사용, 순환 참조 방지)
 */
import {
  deleteSecureStore,
  getSecureStore,
  saveSecureStore,
} from "@/utils/secureStore";
import axios from "axios";

const API_URL = "https://domeok.augustzero.duckdns.org";
const PREFIX = "/api/v1";

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getSecureStore("refreshToken");
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post<{
      accessToken?: string;
      access_token?: string;
      token?: string;
      refreshToken?: string;
      refresh_token?: string;
    }>(`${API_URL}${PREFIX}/users/refresh`, {
      refresh_token: refreshToken,
      refreshToken,
    });

    const newAccess =
      data?.accessToken ?? data?.access_token ?? data?.token ?? null;
    const newRefresh =
      data?.refreshToken ?? data?.refresh_token ?? refreshToken;

    if (newAccess) {
      await saveSecureStore("accessToken", newAccess);
      if (newRefresh !== refreshToken) {
        await saveSecureStore("refreshToken", newRefresh);
      }
      return newAccess;
    }
    return null;
  } catch {
    return null;
  }
}

/** 저장된 토큰만 삭제 (axios 헤더 정리는 호출 측에서) */
export async function clearStoredTokens(): Promise<void> {
  await deleteSecureStore("accessToken");
  await deleteSecureStore("refreshToken");
}
