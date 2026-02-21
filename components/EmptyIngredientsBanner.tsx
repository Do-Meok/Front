import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title?: string;
  description?: string;
  buttonLabel?: string;
  onPress?: () => void;
};

export default function EmptyIngredientsBanner({
  title = "재료를 추가해보시겠어요?",
  description = "재료를 등록하면 맞춤 서비스를 이용할 수 있어요.",
  buttonLabel = "재료 탭으로 가서 추가하기",
  onPress,
}: Props) {
  const handlePress =
    onPress ?? (() => router.push("/(tabs)/ingredients" as any));

  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Ionicons name="nutrition-outline" size={36} color="#bbb" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>
      <Pressable style={styles.btn} onPress={handlePress}>
        <Ionicons name="add-circle-outline" size={16} color={colors.WHITE} />
        <Text style={styles.btnText}>{buttonLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.BLACK,
  },
  desc: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.INACTIVE,
    textAlign: "center",
    lineHeight: 20,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.BLACK,
    borderRadius: 12,
  },
  btnText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: "700",
  },
});
