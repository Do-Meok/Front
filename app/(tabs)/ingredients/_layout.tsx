import { colors } from "@/constants";
import { FridgeProvider } from "@/providers/FridgeProvider";
import { Stack } from "expo-router";

export default function MyLayout() {
  return (
    <FridgeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.WHITE,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            title: "재료",
          }}
        />
        <Stack.Screen
          name="manage/index"
          options={{
            headerShown: false,
            title: "재료 관리",
          }}
        />
        <Stack.Screen
          name="fridge"
          options={{
            headerShown: false,
            title: "냉장고 관리",
          }}
        />
      </Stack>
    </FridgeProvider>
  );
}
