import type { RecipeDetailResponse } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function RecipeDetailContent({
  detail,
}: {
  detail: RecipeDetailResponse;
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.detailContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="restaurant-outline" size={28} color="#111" />
        </View>
        <Text style={styles.h1}>{detail.food}</Text>
      </View>

      <Text style={styles.sectionTitle}>사용할 식재료</Text>
      <View style={styles.box}>
        {detail.use_ingredients.map((it) => (
          <View key={it.name} style={styles.ingRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#666" />
            <Text style={styles.ingText}>{it.name}</Text>
            {it.amount ? (
              <Text style={styles.ingAmount}>{it.amount}</Text>
            ) : null}
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>요리 방법</Text>
      <View style={styles.box}>
        {detail.steps.map((s, idx) => (
          <View key={idx} style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{idx + 1}</Text>
            </View>
            <Text style={styles.stepText}>{s}</Text>
          </View>
        ))}
      </View>

      {detail.tip ? (
        <>
          <Text style={styles.sectionTitle}>팁</Text>
          <View style={styles.box}>
            <Text style={styles.tipText}>{detail.tip}</Text>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  detailContent: { paddingTop: 20, paddingBottom: 32 },
  hero: {
    borderWidth: 1,
    borderColor: "#ededed",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ededed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
  },
  h1: { fontSize: 22, fontWeight: "900", color: "#111" },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "900",
    color: "#111",
  },
  box: {
    borderWidth: 1,
    borderColor: "#ededed",
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  ingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ingText: { flex: 1, fontWeight: "800", color: "#111" },
  ingAmount: { fontSize: 13, color: "#666" },
  stepRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ededed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  stepNumText: { fontWeight: "900", color: "#111", fontSize: 12 },
  stepText: { flex: 1, color: "#333", fontWeight: "700", lineHeight: 18 },
  tipText: { color: "#333", fontWeight: "600", lineHeight: 20 },
});
