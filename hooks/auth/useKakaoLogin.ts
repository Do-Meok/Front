import { getKakaoAuthUrl } from "@/api/auth";
import axiosInstance from "@/api/axios";
import { useNavigationContext } from "@/providers/NavigationProvider";
import { saveSecureStore } from "@/utils/secureStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Alert } from "react-native";

/**
 * 카카오 로그인 훅
 *
 * 흐름:
 * 1. 백엔드에서 카카오 OAuth URL 받기 (/auth/kakao)
 * 2. openAuthSessionAsync 로 시스템 브라우저 열기
 * 3. 유저 카카오 로그인
 * 4. 백엔드가 domeok://auth/kakao?access_token=...&refresh_token=... 로 리다이렉트
 * 5. openAuthSessionAsync 가 domeok:// 감지 → 브라우저 자동 닫힘 → URL 반환
 * 6. 토큰 저장 → 홈 이동
 *
 * ⚠️ 백엔드 요구사항:
 * /auth/kakao/redirect 에서 JSON 대신 아래로 리다이렉트해야 함:
 * domeok://auth/kakao?access_token={token}&refresh_token={token}
 */
export default function useKakaoLogin() {
  const { setHasToken } = useNavigationContext();
  const [loading, setLoading] = useState(false);

  const handleKakaoLogin = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const kakaoUrl = await getKakaoAuthUrl();

      // 시스템 브라우저(Android: Chrome Custom Tab / iOS: SFSafariViewController) 열기
      // 두 번째 인자: 이 URL prefix로 리다이렉트되면 자동 감지 후 브라우저 닫고 result 반환
      const result = await WebBrowser.openAuthSessionAsync(
        kakaoUrl,
        "domeok://auth/kakao",
      );

      // 유저가 취소하거나 실패한 경우
      if (result.type !== "success") return;

      // 백엔드가 리다이렉트한 URL: domeok://auth/kakao?access_token=...&refresh_token=...
      const parsed = Linking.parse(result.url);
      const q = (parsed.queryParams ?? {}) as Record<string, string>;
      const accessToken = q.access_token ?? q.accessToken;
      const refreshToken = q.refresh_token ?? q.refreshToken;

      if (!accessToken) {
        Alert.alert("오류", "카카오 로그인에 실패했습니다.");
        return;
      }

      await saveSecureStore("accessToken", accessToken);
      if (refreshToken) await saveSecureStore("refreshToken", refreshToken);
      await AsyncStorage.removeItem("is_guest");
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;
      setHasToken(true);
      router.replace("/auth/loading");
    } catch {
      Alert.alert("오류", "카카오 로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return { handleKakaoLogin, loading };
}
