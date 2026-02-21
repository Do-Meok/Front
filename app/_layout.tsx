import queryClient from "@/api/queryClient";
import AuthKakaoRedirectHandler from "@/components/AuthKakaoRedirectHandler";
import { NavigationProvider } from "@/providers/NavigationProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

// 인증 상태 확인이 완료될 때까지 스플래시 스크린 유지
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationProvider>
        <AuthKakaoRedirectHandler />
        <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)">
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="mypage" />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", headerShown: true, title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </NavigationProvider>
    </QueryClientProvider>
  );
}
