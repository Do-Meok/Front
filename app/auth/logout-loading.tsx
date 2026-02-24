import { logout } from "@/api/auth";
import RecipeLoadingScreen from "@/components/RecipeLoadingScreen";
import { useNavigationContext } from "@/providers/NavigationProvider";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LOADING_DURATION_MS = 1500;

/**
 * 로그아웃 처리 중 로딩 화면.
 * 실제 로그아웃 API 호출 및 토큰 삭제를 수행한 후 로그인 화면으로 이동합니다.
 */
export default function LogoutLoadingScreen() {
  const { setHasToken } = useNavigationContext();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // 로그아웃 API 호출 및 토큰 삭제
        await logout();
        // NavigationProvider에 토큰 없음 상태 전달
        setHasToken(false);
      } catch (error) {
        console.error("로그아웃 실패:", error);
        // 실패해도 클라이언트에서는 로그아웃 처리
        setHasToken(false);
      }

      // 로딩 화면 표시 후 로그인 화면으로 이동
      setTimeout(() => {
        router.replace("/auth");
      }, LOADING_DURATION_MS);
    };

    performLogout();
  }, [setHasToken]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1 }}>
        <RecipeLoadingScreen message="로그아웃 중입니다." />
      </View>
    </SafeAreaView>
  );
}
