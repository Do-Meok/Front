import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

interface SettingItemProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}

export default function SettingItem({
  label,
  onPress,
  style,
}: SettingItemProps) {
  return (
    <Pressable style={[styles.menuItem, style]} onPress={onPress}>
      <Text style={styles.menuItemText}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.INACTIVE} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.BLACK,
  },
});
