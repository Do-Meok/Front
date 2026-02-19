import { default as axiosInstance } from "@/api/axios";
import { colors } from "@/constants";
import { useNavigationContext } from "@/providers/NavigationProvider";
import { saveSecureStore } from "@/utils/secureStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

// 인앱 브라우저에서 완료된 OAuth 리다이렉트를 제대로 처리하기 위해 필요
WebBrowser.maybeCompleteAuthSession();

const KAKAO_LOGIN_URL = `/api/v1/users/kakao`;

// Expo Go에서는 exp:// 스킴, 실제 빌드에서는 domeok:// 스킴 사용
// ⚠️ Expo Go에서는 domeok:// 딥링크가 작동하지 않으므로 완전한 테스트는 dev build에서 해야 합니다
const REDIRECT_URL = Linking.createURL("auth/kakao");

export default function AuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { setHasToken } = useNavigationContext();

  const onPressKakao = async () => {
    try {
      setIsLoading(true);

      // 1. 서버에서 카카오 인증 URL 받아오기
      const { data } = await axiosInstance.get<{ auth_url: string }>(KAKAO_LOGIN_URL);
      const authUrl = data?.auth_url;

      if (!authUrl) {
        throw new Error("auth_url을 받지 못했습니다.");
      }

      // 2. 인앱 브라우저로 카카오 인증 페이지 열기
      //    openAuthSessionAsync: OAuth 전용 함수로, 딥링크로 돌아오면 자동으로 닫힘
      const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URL);

      // 3. 결과 처리
      if (result.type === "success" && result.url) {
        const parsed = Linking.parse(result.url);
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
      }
    } catch (e) {
      console.error("[카카오 로그인] 실패:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const onPressCommon = () => {
    router.push("/auth/login");
  };

  return (
    <>
      <Pressable
        style={[styles.socialBtn, styles.kakao, isLoading && styles.disabled]}
        onPress={onPressKakao}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.BLACK} />
            <Text style={styles.socialBtnText}>연결 중...</Text>
          </View>
        ) : (
          <Text style={styles.socialBtnText}>카카오로 시작하기</Text>
        )}
      </Pressable>

      <Pressable style={styles.secondaryBtn} onPress={onPressCommon}>
        <Text style={styles.secondaryBtnText}>일반 로그인으로 시작하기</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  socialBtn: {
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  kakao: {
    backgroundColor: "#FEE500",
  },
  disabled: {
    opacity: 0.7,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.BLACK,
  },
  secondaryBtn: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    backgroundColor: colors.WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.BLACK,
  },
});
