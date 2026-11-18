import axiosInstance from "@/api/axios";
import { useNavigationContext } from "@/providers/NavigationProvider";
import { saveSecureStore } from "@/utils/secureStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect } from "react";

/**
 * 카카오 로그인 후 백엔드가 앱으로 리다이렉트할 때
 * domeok://auth/kakao?access_token=...&refresh_token=... 형식의 딥링크를 처리합니다.
 */
// 외부 앱/웹페이지가 공격자 토큰이 담긴 딥링크로 강제 로그인시키는 것을 막기 위해, 앱에서 카카오 로그인을 시작한 직후에만 허용
let kakaoLoginStartedAt = 0;
export const markKakaoLoginStarted = () => {
  kakaoLoginStartedAt = Date.now();
};

export default function AuthKakaoRedirectHandler() {
  const { setHasToken } = useNavigationContext();

  useEffect(() => {
    const handleUrl = async (event: { url: string }) => {
      const url = event.url;
      if (!url || !url.includes("auth/kakao")) return;
      if (Date.now() - kakaoLoginStartedAt > 10 * 60 * 1000) return;
      kakaoLoginStartedAt = 0;

      const parsed = Linking.parse(url);
      const query = (parsed.queryParams || {}) as Record<string, string>;
      const accessToken = query.access_token || query.accessToken;
      const refreshToken = query.refresh_token || query.refreshToken;

      if (accessToken) {
        await saveSecureStore("accessToken", accessToken);
        if (refreshToken) {
          await saveSecureStore("refreshToken", refreshToken);
        }
        await AsyncStorage.removeItem("is_guest");
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        setHasToken(true);
        router.replace("/auth/loading");
      }
    };

    const subscription = Linking.addEventListener("url", handleUrl);

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => subscription.remove();
  }, [setHasToken]);

  return null;
}
