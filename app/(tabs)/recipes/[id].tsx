import PageHeader from "@/components/PageHeader";
import RecipeLoadingScreen from "@/components/RecipeLoadingScreen";
import useGetRecipes from "@/hooks/recipes/useGetRecipes";
import type { SaveRecipeResponse } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function RecipeDetailScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const { data: recipes, isLoading, error } = useGetRecipes();

  const goBack = () => {
    if (from === "home") {
      router.replace("/(tabs)");
    } else {
      router.back();
    }
  };

  const detail = useMemo((): SaveRecipeResponse | null => {
    const key = String(id ?? "");
    if (!recipes?.length) return null;
    return (
      recipes.find((r) => String(r.id) === key) ??
      (null as SaveRecipeResponse | null)
    );
  }, [recipes, id]);

  const renderBody = () => {
    if (isLoading) {
      return (
        <RecipeLoadingScreen message="레시피를 받아오는 중입니다." />
      );
    }
    if (error || !detail) {
      return (
        <View style={styles.centerWrap}>
          <Ionicons name="document-text-outline" size={40} color="#999" />
          <Text style={styles.emptyTitle}>레시피를 찾을 수 없어요</Text>
          <Text style={styles.emptyDesc}>
            목록에서 레시피를 선택하면 조리법이 생성됩니다.
          </Text>
          <Pressable onPress={goBack} style={styles.backToListButton}>
            <Text style={styles.backToListButtonText}>목록으로</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {/* 헤더 카드 */}
          <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="restaurant-outline" size={28} color="#111" />
          </View>
          <Text style={styles.h1}>{detail.food}</Text>
          {detail.created_at && (
            <Text style={styles.createdAt}>
              저장일: {detail.created_at.slice(0, 10)}
            </Text>
          )}
        </View>

        {/* 재료 섹션 */}
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

        {/* 방법 섹션 */}
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
      </>
    );
  };

  return (
    <View style={styles.page}>
      <PageHeader
        title="레시피 상세"
        leftChild={
          <Pressable onPress={goBack} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </Pressable>
        }
        rightChild={
          detail ? (
            <Pressable onPress={() => {}} style={styles.iconBtn}>
              <Ionicons name="share-social-outline" size={20} color="#111" />
            </Pressable>
          ) : undefined
        }
      />
      {renderBody()}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ededed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  hero: {
    marginTop: 12,
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
  createdAt: { fontSize: 12, color: "#666" },

  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 24,
  },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#111" },
  emptyDesc: { fontSize: 13, color: "#666", textAlign: "center" },

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

  backToListButton: {
    marginTop: 14,
    minWidth: 160,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  backToListButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
});
