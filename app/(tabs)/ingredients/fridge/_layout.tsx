import { colors } from "@/constants";
import { Stack } from "expo-router";

export default function FridgeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.WHITE,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "냉장고 관리" }} />
      <Stack.Screen name="add-fridge" options={{ title: "냉장고 추가" }} />
      <Stack.Screen name="add" options={{ title: "냉장고 식재료 넣기" }} />
      <Stack.Screen name="search" options={{ title: "냉장고 재료 검색" }} />
    </Stack>
  );
}
