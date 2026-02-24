import { colors } from "@/constants";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type TabBarItemProps = {
  showDividerRight: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  icon: React.ReactNode;
  label: string;
  color: string;
  rippleColor?: string;
};

export default function TabBarItem({
  showDividerRight,
  onPress,
  onLongPress,
  icon,
  label,
  color,
  rippleColor = colors.BLACK,
}: TabBarItemProps) {
  return (
    <View style={[styles.itemWrap, showDividerRight && styles.dividerRight]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
        android_ripple={{ color: rippleColor, borderless: false }}
      >
        {icon}
        <Text style={[styles.label, { color }]} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  itemWrap: { flex: 1 },
  dividerRight: { borderRightWidth: 1, borderRightColor: colors.BORDER },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  label: { fontSize: 12, marginTop: 2 },
});
