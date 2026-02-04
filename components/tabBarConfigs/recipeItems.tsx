import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { TabBarItem } from "./types";

export function getRecipeTabBarItems(pathname: string): TabBarItem[] {
  const inRecipes =
    pathname === "/recipes" || pathname.startsWith("/recipes/");

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
      key: "recipes",
      label: "레시피",
      focused:
        inRecipes &&
        !pathname.startsWith("/recipes/recommend") &&
        !pathname.startsWith("/recipes/log"),
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "book" : "book-outline"}
          size={20}
          color={color}
        />
      ),
      go: () => router.replace("/recipes"),
    },
    {
      key: "recommend",
      label: "레시피 추천",
      focused: pathname.startsWith("/recipes/recommend"),
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "sparkles" : "sparkles-outline"}
          size={20}
          color={color}
        />
      ),
      go: () => router.replace("/recipes/recommend"),
    },
    {
      key: "log",
      label: "요리 기록",
      focused: pathname.startsWith("/recipes/log"),
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "calendar" : "calendar-outline"}
          size={20}
          color={color}
        />
      ),
      go: () => router.replace("/recipes/log"),
    },
  ];
}
