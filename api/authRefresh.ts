/**
 * 토큰 갱신/삭제만 담당 (axios 인터셉터에서 사용, 순환 참조 방지)
 */
import { RefreshResponse } from "@/types";
import {
  deleteSecureStore,
  getSecureStore,
  saveSecureStore,
} from "@/utils/secureStore";
import axios from "axios";
import { API_URL, PREFIX } from "./config";

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getSecureStore("refreshToken");
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post<RefreshResponse>(`${API_URL}${PREFIX}/auth/refresh`, {
      refresh_token: refreshToken,
    });

    const newAccess = data?.access_token ?? null;
    const newRefresh = data?.refresh_token ?? refreshToken;

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
