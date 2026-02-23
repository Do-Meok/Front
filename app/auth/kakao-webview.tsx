import { getKakaoAuthUrl } from "@/api/auth";
import axiosInstance, { PREFIX } from "@/api/axios";
import BackHeader from "@/components/BackHeader";
import { INJECTED_JS } from "@/constants";
import { useNavigationContext } from "@/providers/NavigationProvider";
import { saveSecureStore } from "@/utils/secureStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

export default function KakaoWebViewScreen() {
  const [kakaoUrl, setKakaoUrl] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const { setHasToken } = useNavigationContext();
  const processRef = useRef(false);

  useEffect(() => {
    getKakaoAuthUrl().then(setKakaoUrl);
  }, []);

  const handleTokens = async (accessToken: string, refreshToken?: string) => {
    await saveSecureStore("accessToken", accessToken);
    if (refreshToken) await saveSecureStore("refreshToken", refreshToken);
    await AsyncStorage.removeItem("is_guest");
    axiosInstance.defaults.headers.common["Authorization"] =
      `Bearer ${accessToken}`;
    setHasToken(true);
    router.replace("/auth/loading");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <BackHeader onBack={() => router.back()} />

      {/* 로더 오버레이: 리다이렉트 페이지 내용이 보이지 않도록 덮음 */}
      {pageLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#FEE500" />
        </View>
      )}

      {kakaoUrl && (
        <WebView
          source={{ uri: kakaoUrl }}
          injectedJavaScript={INJECTED_JS}
          onLoadEnd={(e) => {
            const url = e.nativeEvent.url;
            const isRedirectPage =
              url.includes("/auth/kakao/redirect") && url.includes("code=");
            // 리다이렉트 페이지가 아닐 때만 로더 숨기기 (카카오 로그인 폼 표시)
            if (!isRedirectPage) setPageLoading(false);
          }}
          onMessage={(event) => {
            if (processRef.current) return;
            try {
              const msg = JSON.parse(event.nativeEvent.data);
              if (msg.type !== "kakao_redirect") return;

              processRef.current = true;
              setPageLoading(true);

              // 1순위: body JSON에서 토큰 직접 파싱
              try {
                const tokens = JSON.parse(msg.body);
                if (tokens.access_token) {
                  handleTokens(tokens.access_token, tokens.refresh_token);
                  return;
                }
              } catch {}

              // 2순위: body 파싱 실패 시 URL의 code/state로 백엔드 직접 호출
              const parsed = Linking.parse(msg.url);
              const code = parsed.queryParams?.code as string;
              const state = parsed.queryParams?.state as string | undefined;

              axiosInstance
                .get<{ access_token: string; refresh_token: string }>(
                  `${PREFIX}/auth/kakao/redirect`,
                  { params: { code, state } },
                )
                .then(({ data }) =>
                  handleTokens(data.access_token, data.refresh_token),
                )
                .catch(() => {
                  processRef.current = false;
                  router.back();
                });
            } catch {}
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    zIndex: 10,
  },
});
