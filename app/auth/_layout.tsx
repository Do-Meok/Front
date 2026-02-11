import { colors } from "@/constants";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.BLACK,
        contentStyle: {
          backgroundColor: colors.WHITE,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "로그인",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "로그인",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: "회원가입",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="find-email"
        options={{ title: "이메일 찾기", headerShown: false }}
      />
      <Stack.Screen
        name="find-password"
        options={{ title: "비밀번호 찾기", headerShown: false }}
      />
      <Stack.Screen
        name="change-password"
        options={{ title: "비밀번호 변경", headerShown: false }}
      />
      <Stack.Screen
        name="change-nickname"
        options={{ title: "닉네임 변경", headerShown: false }}
      />
    </Stack>
  );
}
