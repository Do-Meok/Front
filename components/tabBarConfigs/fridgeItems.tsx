import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { TabBarItem } from "./types";

export function getFridgeTabBarItems(pathname: string): TabBarItem[] {
  const inFridge = pathname === "/(tabs)/ingredients/fridge" || pathname.startsWith("/(tabs)/ingredients/fridge/");

  return [
    {
      key: "home",
      label: "홈",
      focused: pathname === "/" || pathname === "/index",
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "arrow-back" : "arrow-back-outline"}
          size={20}
          color={color}
        />
      ),
      go: () => router.replace("/"),
    },
    {
      key: "fridge",
      label: "냉장고",
      focused:
        inFridge &&
        !pathname.startsWith("/(tabs)/ingredients/fridge/search") &&
        !pathname.startsWith("/(tabs)/ingredients/fridge/add"),
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "snow" : "snow-outline"}
          size={20}
          color={color}
        />
      ),
      go: () => router.replace("/(tabs)/ingredients/fridge"),
    },
    {
      key: "search",
      label: "냉장고 재료 검색",
      focused: pathname.startsWith("/(tabs)/ingredients/fridge/search"),
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "search" : "search-outline"}
          size={20}
          color={color}
        />
      ),
      go: () => router.replace("/(tabs)/ingredients/fridge/search"),
    },
    {
      key: "add",
      label: "냉장고 식재료 넣기",
      focused:
        pathname.startsWith("/(tabs)/ingredients/fridge/add") &&
        !pathname.startsWith("/(tabs)/ingredients/fridge/add-fridge"),
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "add-circle" : "add-circle-outline"}
          size={20}
          color={color}
        />
      ),
      go: () => router.replace("/(tabs)/ingredients/fridge/add"),
    },
  ];
}
