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
    </Stack>
  );
}
