import { deleteIngredient } from "@/api/ingredients";
import queryClient from "@/api/queryClient";
import PageHeader from "@/components/PageHeader";
import RecipeLoadingScreen from "@/components/RecipeLoadingScreen";
import { queryKey } from "@/constants";
import useGetIngredients from "@/hooks/ingredients/useGetIngredients";
import useGetRecipes from "@/hooks/recipes/useGetRecipes";
import type { GetIngredientResponse, SaveRecipeResponse } from "@/types";
import { getCompletedRecipeIds, markRecipeCompleted } from "@/utils/completedRecipes";
import { useFridgeContext } from "@/providers/FridgeProvider";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "");

function ingredientMatches(recipeName: string, userIngredientName: string): boolean {
  const rn = normalize(recipeName);
  const un = normalize(userIngredientName);
  if (rn === un) return true;
  const [shorter, longer] = rn.length <= un.length ? [rn, un] : [un, rn];
  return shorter.length >= 2 && longer.includes(shorter);
}

export default function RecipeDetailScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const { data: recipes, isLoading, error } = useGetRecipes();
  const { data: ingredients = [] } = useGetIngredients();
  const { removeLocalIngredient } = useFridgeContext();

  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(true);
  const [isCompletingRecipe, setIsCompletingRecipe] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCompletedRecipeIds().then((ids) => {
      setIsCompleted(ids.has(String(id)));
      setIsLoadingCompleted(false);
    });
  }, [id]);

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

  // 레시피 재료 이름 → 사용자 보유 재료 매핑
  const matchedMap = useMemo(() => {
    if (!detail || !ingredients.length) return new Map<string, GetIngredientResponse>();
    const map = new Map<string, GetIngredientResponse>();
    for (const recipeIng of detail.use_ingredients) {
      const found = ingredients.find((userIng) =>
        ingredientMatches(recipeIng.name, userIng.ingredient_name)
      );
      if (found) {
        map.set(recipeIng.name, found);
      }
    }
    return map;
  }, [detail, ingredients]);

  const handleCompleteRecipe = () => {
    if (!detail || matchedMap.size === 0) return;
    Alert.alert(
      "요리 완료",
      `보유 중인 재료 ${matchedMap.size}개가 소진 처리됩니다.\n계속하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "완료",
          onPress: async () => {
            setIsCompletingRecipe(true);
            try {
              const deletedIngredients = [...matchedMap.values()];
              await Promise.all(
                deletedIngredients.map((ing) => deleteIngredient(ing.id))
              );
              deletedIngredients.forEach((ing) => removeLocalIngredient(ing.id));
              queryClient.invalidateQueries({ queryKey: [queryKey.INGREDIENTS] });
              queryClient.invalidateQueries({ queryKey: [queryKey.REFRIGERATOR] });
              queryClient.invalidateQueries({ queryKey: [queryKey.COMPARTMENT_INGREDIENTS] });
              await markRecipeCompleted(String(detail.id));
              setIsCompleted(true);
            } catch {
              Alert.alert("오류", "재료 소진 처리 중 오류가 발생했습니다.");
            } finally {
              setIsCompletingRecipe(false);
            }
          },
        },
      ]
    );
  };

  const showCompleteBtn =
    !!detail &&
    !isCompleted &&
    !isLoadingCompleted &&
    matchedMap.size > 0 &&
    !isLoading;

  const renderBody = () => {
    if (isLoading) {
      return <RecipeLoadingScreen message="레시피를 받아오는 중입니다." />;
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
      <ScrollView contentContainerStyle={{ paddingBottom: showCompleteBtn ? 96 : 24 }}>
        {/* 헤더 카드 */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="restaurant-outline" size={28} color="#111" />
          </View>
          <Text style={styles.h1}>{detail.food}</Text>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#fff" />
              <Text style={styles.completedBadgeText}>요리 완료</Text>
            </View>
          )}
          {detail.created_at && (
            <Text style={styles.createdAt}>
              저장일: {detail.created_at.slice(0, 10)}
            </Text>
          )}
        </View>

        {/* 재료 섹션 */}
        <Text style={styles.sectionTitle}>사용할 식재료</Text>
        {matchedMap.size > 0 && !isCompleted && (
          <Text style={styles.matchHint}>
            보유 중인 재료가 초록색으로 표시됩니다
          </Text>
        )}
        <View style={styles.box}>
          {detail.use_ingredients.map((it) => {
            const isMatched = matchedMap.has(it.name);
            return (
              <View key={it.name} style={styles.ingRow}>
                <Ionicons
                  name={isMatched && isCompleted ? "remove-circle" : isMatched ? "checkmark-circle" : "checkmark-circle-outline"}
                  size={18}
                  color={isMatched && isCompleted ? "#aaa" : isMatched ? "#22c55e" : "#aaa"}
                />
                <Text style={[
                  styles.ingText,
                  isMatched && !isCompleted && styles.ingTextMatched,
                  isMatched && isCompleted && styles.ingTextConsumed,
                ]}>
                  {it.name}
                </Text>
                {it.amount ? (
                  <Text style={[styles.ingAmount, isMatched && isCompleted && styles.ingAmountConsumed]}>{it.amount}</Text>
                ) : null}
                {isMatched && !isCompleted && (
                  <View style={styles.haveTag}>
                    <Text style={styles.haveTagText}>보유중</Text>
                  </View>
                )}
                {isMatched && isCompleted && (
                  <View style={styles.usedTag}>
                    <Text style={styles.usedTagText}>소진됨</Text>
                  </View>
                )}
              </View>
            );
          })}
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
      {showCompleteBtn && (
        <View style={styles.bottomBar}>
          <Pressable
            onPress={handleCompleteRecipe}
            style={[styles.completeBtn, isCompletingRecipe && styles.completeBtnDisabled]}
            disabled={isCompletingRecipe}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.completeBtnText}>
              {isCompletingRecipe
                ? "처리 중..."
                : `요리완료 (재료 소진 ${matchedMap.size}개)`}
            </Text>
          </Pressable>
        </View>
      )}
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

  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#22c55e",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  completedBadgeText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },

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
  matchHint: {
    fontSize: 12,
    color: "#22c55e",
    marginBottom: 6,
    marginTop: -4,
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
  ingTextMatched: { color: "#16a34a" },
  ingAmount: { fontSize: 13, color: "#666" },
  haveTag: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#86efac",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  haveTagText: {
    fontSize: 11,
    color: "#16a34a",
    fontWeight: "700",
  },

  ingTextConsumed: {
    textDecorationLine: "line-through",
    color: "#aaa",
  },
  ingAmountConsumed: {
    textDecorationLine: "line-through",
    color: "#bbb",
  },
  usedTag: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  usedTagText: {
    fontSize: 11,
    color: "#888",
    fontWeight: "700",
  },

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

  bottomBar: {
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#22c55e",
  },
  completeBtnDisabled: { opacity: 0.6 },
  completeBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
});
