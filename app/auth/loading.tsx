import RecipeLoadingScreen from "@/components/RecipeLoadingScreen";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LOADING_DURATION_MS = 1500;

/**
 * 로그인(이메일/카카오) 성공 후 홈으로 이동하기 전 로딩 화면.
 */
export default function AuthLoadingScreen() {
  useEffect(() => {
    const t = setTimeout(() => {
      router.replace("/(tabs)");
    }, LOADING_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1 }}>
        <RecipeLoadingScreen message="홈으로 이동 중입니다." />
      </View>
    </SafeAreaView>
  );
}
