import axiosInstance from "@/api/axios";
import { saveSecureStore } from "@/utils/secureStore";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect } from "react";

/**
 * 카카오 로그인 후 백엔드가 앱으로 리다이렉트할 때
 * domeok://auth/kakao?access_token=...&refresh_token=... 형식의 딥링크를 처리합니다.
 */
export default function AuthKakaoRedirectHandler() {
  useEffect(() => {
    const handleUrl = async (event: { url: string }) => {
      const url = event.url;
      if (!url || !url.includes("auth/kakao")) return;

      const parsed = Linking.parse(url);
      const query = (parsed.queryParams || {}) as Record<string, string>;
      const accessToken = query.access_token || query.accessToken;
      const refreshToken = query.refresh_token || query.refreshToken;

      if (accessToken) {
        await saveSecureStore("accessToken", accessToken);
        if (refreshToken) {
          await saveSecureStore("refreshToken", refreshToken);
        }
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        router.replace("/(tabs)");
      }
    };

    const subscription = Linking.addEventListener("url", handleUrl);

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => subscription.remove();
  }, []);

  return null;
}
