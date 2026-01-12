import queryClient from "@/api/queryClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigation />
    </QueryClientProvider>
  );
}

function RootNavigation() {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<
    boolean | null
  >(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // 온보딩 완료 여부 확인
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem("onboarding_completed");
        setIsOnboardingCompleted(completed === "true");
      } catch (error) {
        console.error("온보딩 상태 확인 실패:", error);
        setIsOnboardingCompleted(false);
      }
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    if (isOnboardingCompleted === null) return; // 아직 확인 중

    const inAuthGroup = segments[0] === "(onboarding)";

    if (isOnboardingCompleted && inAuthGroup) {
      // 온보딩 완료되었는데 온보딩 화면에 있으면 로그인 화면으로 이동
      router.replace("/auth");
    }
  }, [isOnboardingCompleted, segments]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", headerShown: true, title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
