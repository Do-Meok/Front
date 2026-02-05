import queryClient from "@/api/queryClient";
import { NavigationProvider } from "@/providers/NavigationProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationProvider>
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
