import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function HomeHeader({
  onPressBell,
  onPressProfile,
}: {
  onPressBell?: () => void;
  onPressProfile?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onPressBell} style={styles.icon} hitSlop={10}>
        <Ionicons name="notifications-outline" size={26} color="#111" />
      </Pressable>
      <Pressable onPress={onPressProfile} style={styles.icon} hitSlop={10}>
        <Ionicons name="person-outline" size={26} color="#111" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 8,
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffffaa",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
