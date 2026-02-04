import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { TabBarItem } from "./types";

export function getIngredientTabBarItems(pathname: string): TabBarItem[] {
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
      key: "ingredients",
      label: "재료",
      focused: pathname === "/ingredients",
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "nutrition" : "nutrition-outline"}
          size={20}
          color={color}
        />
      ),
      go: () => router.replace("/ingredients"),
    },
    {
      key: "manage",
      label: "재료 관리",
      focused: pathname.startsWith("/ingredients/manage"),
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "create" : "create-outline"}
          size={20}
          color={color}
        />
      ),
      go: () => router.replace("/ingredients/manage"),
    },
    {
      key: "fridge",
      label: "냉장고 관리",
      focused: pathname.startsWith("/ingredients/fridge"),
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "snow" : "snow-outline"}
          size={20}
          color={color}
        />
      ),
      go: () => router.replace("/ingredients/fridge"),
    },
  ];
}
