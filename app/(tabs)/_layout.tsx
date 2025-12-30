import SketchTabBar from "@/components/SketchTabar";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <SketchTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* 홈 */}
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size ?? 26}
              color={color}
            />
          ),
        }}
      />

      {/* 재료 */}
      <Tabs.Screen
        name="ingredients"
        options={{
          title: "재료",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "nutrition" : "nutrition-outline"}
              size={size ?? 26}
              color={color}
            />
          ),
        }}
      />

      {/* 레시피 */}
      <Tabs.Screen
        name="recipes"
        options={{
          title: "레시피",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              size={size ?? 26}
              color={color}
            />
          ),
        }}
      />

      {/* 장보기 리스트 */}
      <Tabs.Screen
        name="shopping-list"
        options={{
          title: "장보기 리스트",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={size ?? 26}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
