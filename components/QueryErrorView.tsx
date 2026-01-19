import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type QueryErrorViewProps = {
  error: unknown;
  hasToken: boolean;
  onRetry: () => void;
  onLogin?: () => void;
};

/**
 * API 에러 시 공통 UI.
 * - 로그인 안 했을 때 (!hasToken): 401/500 등 어떤 에러든 "로그인 후, 이용해 주세요." + 로그인하러 가기
 * - 로그인 했는데 401: "인증에 실패했습니다. 다시 로그인해주세요." (버튼 없음)
 * - 로그인 했는데 그 외 에러: "데이터를 불러오는데 실패했습니다." + 다시시도하기
 */
export default function QueryErrorView({
  error,
  hasToken,
  onRetry,
  onLogin = () => router.replace("/auth"),
}: QueryErrorViewProps) {
  const status =
    (error as any)?.response?.status ?? (error as any)?.status;
  const isUnauthorized = status === 401;

  // 로그인을 안 했으면 (401, 500 등 모든 에러) → 로그인 유도
  const showLoginButton = !hasToken;
  // 토큰 있는데 401이면 재시도 무의미; 그 외(500 등)만 다시시도
  const showRetryButton = hasToken && !isUnauthorized;

  let message: string;
  if (!hasToken) {
    message = "로그인 후, 이용해 주세요.";
  } else if (isUnauthorized) {
    message = "인증에 실패했습니다. 다시 로그인해주세요.";
  } else {
    message = "데이터를 불러오는데 실패했습니다.";
  }

  return (
    <View style={styles.errorContainer}>
      <Ionicons name="lock-closed-outline" size={48} color="#c1121f" />
      <Text style={styles.errorText}>{message}</Text>
      {showLoginButton && (
        <Pressable style={styles.loginBtn} onPress={onLogin}>
          <Text style={styles.loginBtnText}>로그인하러 가기</Text>
        </Pressable>
      )}
      {showRetryButton && (
        <Pressable style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryBtnText}>다시시도하기</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  errorText: { color: "#c1121f", fontSize: 14, textAlign: "center" },
  loginBtn: {
    marginTop: 8,
    backgroundColor: colors.BLACK,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  loginBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },
  retryBtn: {
    marginTop: 8,
    backgroundColor: colors.BLACK,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  retryBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },
});
