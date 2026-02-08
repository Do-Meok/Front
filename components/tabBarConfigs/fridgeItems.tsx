import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { TabBarItem } from "./types";

export function getFridgeTabBarItems(pathname: string): TabBarItem[] {
  const inFridge = pathname === "/fridge" || pathname.startsWith("/fridge/");

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
        !pathname.startsWith("/fridge/search") &&
        !pathname.startsWith("/fridge/add"),
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "snow" : "snow-outline"}
          size={20}
          color={color}
        />
      ),
      go: () => router.replace("/fridge"),
    },
    {
      key: "search",
      label: "냉장고 재료 검색",
      focused: pathname.startsWith("/fridge/search"),
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "search" : "search-outline"}
          size={20}
          color={color}
        />
      ),
      go: () => router.replace("/fridge/search"),
    },
    {
      key: "add",
      label: "냉장고 식재료 넣기",
      focused:
        pathname.startsWith("/fridge/add") &&
        !pathname.startsWith("/fridge/add-fridge"),
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "add-circle" : "add-circle-outline"}
          size={20}
          color={color}
        />
      ),
      go: () => router.replace("/fridge/add"),
    },
  ];
}
