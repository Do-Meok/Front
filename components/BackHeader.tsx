import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const SIDE_WIDTH = 40;

type BackHeaderProps = {
  title?: string;
  onBack?: () => void;
};

/**
 * 인증 화면용 뒤로가기 헤더.
 * PageHeader와 동일한 레이아웃 구조 — SafeAreaView 내부에 배치하면
 * 기기별 노치·상태바에 관계없이 안전하게 표시됩니다.
 */
export default function BackHeader({ title, onBack }: BackHeaderProps) {
  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={styles.container}>
      <View style={styles.sideLeft}>
        <Pressable onPress={handleBack} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#111" />
        </Pressable>
      </View>

      <View style={styles.center}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
      </View>

      {/* 오른쪽 여백 — 제목이 정확히 가운데 오도록 */}
      <View style={styles.sideRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideLeft: {
    minWidth: SIDE_WIDTH,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  sideRight: {
    minWidth: SIDE_WIDTH,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  backBtn: {
    width: SIDE_WIDTH,
    height: SIDE_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
});
