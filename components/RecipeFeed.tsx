import EmptyIngredientsBanner from "@/components/EmptyIngredientsBanner";
import FeaturedRecipeCarousel, {
  type FeaturedRecipe,
} from "@/components/FeaturedRecipeCarousel";
import PageHeader from "@/components/PageHeader";
import QueryErrorView from "@/components/QueryErrorView";
import RecipeLoadingScreen from "@/components/RecipeLoadingScreen";
import RecipeLogList from "@/components/RecipeLogList";
import { colors } from "@/constants";
import useCreateRecipeDetails from "@/hooks/assistant/useCreateRecipeDetails";
import useGetRecommendationsRecipes from "@/hooks/assistant/useGetRecommendationsRecipes";
import useGetIngredients from "@/hooks/ingredients/useGetIngredients";
import useGetRecipes from "@/hooks/recipes/useGetRecipes";
import useSaveRecipe from "@/hooks/recipes/useSaveRecipe";
import type { CreateRecipeDetailsResponse, RecipeRecommendationItem } from "@/types";
import { getCompletedRecipeIds } from "@/utils/completedRecipes";
import { getSecureStore } from "@/utils/secureStore";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export type Recipe = {
  id: string;
  title: string;
  desc: string;
  rating: number; // 0~5
  cookMin: number;
  image?: string;
  tags: string[];
};

const MOCK_RECIPES: Recipe[] = [
  {
    id: "kimchi-jjigae",
    title: "김치찌개",
    desc: "집에 있는 김치로 간단하게 끓이는 레시피",
    rating: 4.6,
    cookMin: 25,
    tags: ["한식", "국물", "매콤"],
  },
  {
    id: "cream-pasta",
    title: "크림 파스타",
    desc: "우유/생크림으로 만드는 부드러운 파스타",
    rating: 4.2,
    cookMin: 20,
    tags: ["양식", "면", "크림"],
  },
  {
    id: "egg-fried-rice",
    title: "계란 볶음밥",
    desc: "계란만 있으면 되는 초간단 한 끼",
    rating: 4.0,
    cookMin: 10,
    tags: ["간편", "밥", "10분"],
  },
];

type Mode = "list" | "recommend" | "log";

export default function RecipeFeed({ mode }: { mode: Mode }) {
  const [q, setQ] = useState("");
  const [hasToken, setHasToken] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [pendingRecipe, setPendingRecipe] =
    useState<CreateRecipeDetailsResponse | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (mode === "log") {
        getCompletedRecipeIds().then(setCompletedIds);
      }
    }, [mode]),
  );

  const {
    data: recommendationsData,
    isLoading: isRecommendLoading,
    error: recommendError,
    refetch: refetchRecommendations,
    isRefetching: isRecommendRefetching,
  } = useGetRecommendationsRecipes();

  const { data: ingredients = [], isLoading: isIngredientsLoading } =
    useGetIngredients();

  const createRecipeDetailsMutation = useCreateRecipeDetails();
  const saveRecipeMutation = useSaveRecipe();
  const {
    data: savedRecipes,
    isLoading: isLogLoading,
    error: logError,
    refetch: refetchLog,
  } = useGetRecipes();

  const handlePressRecipeItem = (item: FeaturedRecipe) => {
    if (mode === "log") {
      router.push(`/recipes/${item.id}`);
      return;
    }
    const getRecommendationPayload = (): RecipeRecommendationItem | null => {
      if (mode === "recommend" && recommendationsData?.recipes?.length) {
        const match = item.id.match(/^recommend-(\d+)-/);
        const idx = match ? parseInt(match[1], 10) : -1;
        if (idx >= 0 && recommendationsData.recipes[idx])
          return recommendationsData.recipes[idx];
      }
      if (mode === "list") {
        return {
          food: item.title,
          use_ingredients: [],
          difficulty: 3,
        };
      }
      return null;
    };

    const payload = getRecommendationPayload();
    if (!payload) {
      router.push(`/recipes/${item.id}`);
      return;
    }

    const existing = (savedRecipes ?? []).find((r) => r.food === payload.food);
    if (existing) {
      router.push(`/recipes/${existing.id}`);
      return;
    }

    if (mode === "recommend") {
      // 추천 모드: 레시피 상세를 생성한 뒤 미리보기 모달로 보여주고
      // 사용자가 "저장하기"를 눌러야 요리기록에 저장됨
      createRecipeDetailsMutation.mutate(payload, {
        onSuccess: (detail) => {
          setPendingRecipe(detail);
        },
      });
      return;
    }

    // list 모드: 기존 동작 유지 (생성 후 바로 저장)
    createRecipeDetailsMutation.mutate(payload, {
      onSuccess: (detail) => {
        saveRecipeMutation.mutate(detail, {
          onSuccess: (saved) => {
            router.push(`/recipes/${saved.id}`);
          },
        });
      },
    });
  };

  const handleSavePendingRecipe = () => {
    if (!pendingRecipe) return;
    saveRecipeMutation.mutate(pendingRecipe, {
      onSuccess: (saved) => {
        setPendingRecipe(null);
        router.push(`/recipes/${saved.id}`);
      },
    });
  };

  useEffect(() => {
    if (mode === "recommend") {
      getSecureStore("accessToken").then((token) => setHasToken(!!token));
    }
  }, [mode]);

  const baseList = useMemo(() => {
    if (mode === "log") {
      return (savedRecipes ?? []).map((r) => ({
        id: String(r.id),
        title: r.food,
        desc: r.created_at ? `저장일: ${r.created_at.slice(0, 10)}` : "",
        rating: 0,
        cookMin: 0,
        image: undefined,
        tags: [] as string[],
        isCompleted: completedIds.has(String(r.id)),
      }));
    }
    if (mode === "recommend") return [];
    return MOCK_RECIPES;
  }, [mode, savedRecipes, completedIds]);

  const list = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return baseList;

    return baseList.filter(
      (r) =>
        r.title.toLowerCase().includes(qq) ||
        r.desc.toLowerCase().includes(qq) ||
        (r.tags && r.tags.join(" ").toLowerCase().includes(qq)),
    );
  }, [baseList, q]);

  const featuredItems = useMemo((): FeaturedRecipe[] => {
    return list.map((r) => ({
      id: r.id,
      title: r.title,
      desc: r.desc,
      ...(r.image !== undefined && { image: r.image }),
      ...("isCompleted" in r && { isCompleted: r.isCompleted as boolean | undefined }),
    }));
  }, [list]);

  const recommendCarouselItems = useMemo((): FeaturedRecipe[] => {
    const recipes = recommendationsData?.recipes ?? [];
    return recipes.map((r, i) => ({
      id: `recommend-${i}-${r.food}`,
      title: r.food,
      desc: r.use_ingredients?.length
        ? `사용 재료: ${r.use_ingredients.join(", ")}`
        : "",
      difficulty: r.difficulty,
    }));
  }, [recommendationsData?.recipes]);

  const title =
    mode === "recommend"
      ? "레시피 추천"
      : mode === "log"
        ? "요리 기록"
        : "레시피";

  // 추천 모드에서는 saveRecipeMutation은 미리보기 모달에서 처리하므로 제외
  const isRecipeLoading =
    createRecipeDetailsMutation.isPending ||
    (mode !== "recommend" && saveRecipeMutation.isPending);

  const loadingModal = (
    <Modal visible={isRecipeLoading} transparent animationType="fade">
      <View style={styles.loadingModal}>
        <RecipeLoadingScreen message="레시피를 받아오는 중입니다." />
      </View>
    </Modal>
  );

  // 추천 레시피 미리보기 모달 (저장 전 확인용)
  const previewModal = (
    <Modal
      visible={!!pendingRecipe}
      animationType="slide"
      onRequestClose={() => setPendingRecipe(null)}
    >
      <View style={styles.previewModal}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle} numberOfLines={1}>
            {pendingRecipe?.food}
          </Text>
          <Pressable
            onPress={() => setPendingRecipe(null)}
            style={styles.previewCloseBtn}
          >
            <Ionicons name="close" size={22} color="#111" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.previewBody}>
          <Text style={styles.previewSectionTitle}>사용할 식재료</Text>
          <View style={styles.previewBox}>
            {pendingRecipe?.use_ingredients.map((it) => (
              <View key={it.name} style={styles.previewIngRow}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color="#aaa"
                />
                <Text style={styles.previewIngName}>{it.name}</Text>
                {it.amount ? (
                  <Text style={styles.previewIngAmount}>{it.amount}</Text>
                ) : null}
              </View>
            ))}
          </View>

          <Text style={styles.previewSectionTitle}>요리 방법</Text>
          <View style={styles.previewBox}>
            {pendingRecipe?.steps.map((s, idx) => (
              <View key={idx} style={styles.previewStepRow}>
                <View style={styles.previewStepNum}>
                  <Text style={styles.previewStepNumText}>{idx + 1}</Text>
                </View>
                <Text style={styles.previewStepText}>{s}</Text>
              </View>
            ))}
          </View>

          {pendingRecipe?.tip ? (
            <>
              <Text style={styles.previewSectionTitle}>팁</Text>
              <View style={styles.previewBox}>
                <Text style={styles.previewTipText}>{pendingRecipe.tip}</Text>
              </View>
            </>
          ) : null}
        </ScrollView>

        <View style={styles.previewBottomBar}>
          <Pressable
            style={[
              styles.previewSaveBtn,
              saveRecipeMutation.isPending && styles.previewSaveBtnDisabled,
            ]}
            onPress={handleSavePendingRecipe}
            disabled={saveRecipeMutation.isPending}
          >
            <Ionicons name="bookmark-outline" size={18} color="#fff" />
            <Text style={styles.previewSaveBtnText}>
              {saveRecipeMutation.isPending ? "저장 중..." : "요리기록에 저장하기"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  if (mode === "recommend") {
    if (!isIngredientsLoading && ingredients.length === 0) {
      return (
        <View style={styles.page}>
          <PageHeader title={title} />
          <EmptyIngredientsBanner
            title="재료를 추가해볼까요?"
            description={
              "냉장고 재료를 등록하면\nAI 맞춤 레시피를 추천받을 수 있어요."
            }
          />
        </View>
      );
    }
    if (isRecommendLoading && !recommendationsData) {
      return (
        <View style={styles.page}>
          <PageHeader title={title} />
          <View style={styles.emptyWrap}>
            <ActivityIndicator size="large" color={colors.BLACK} />
            <Text style={styles.emptyDesc}>추천 메뉴를 불러오는 중...</Text>
          </View>
        </View>
      );
    }
    if (recommendError && !recommendationsData) {
      return (
        <View style={styles.page}>
          <PageHeader title={title} />
          <QueryErrorView
            error={recommendError}
            hasToken={hasToken}
            onRetry={() => refetchRecommendations()}
          />
        </View>
      );
    }
    return (
      <View style={styles.page}>
        <PageHeader title={title} />
        {recommendCarouselItems.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="restaurant-outline" size={28} color="#999" />
            <Text style={styles.emptyTitle}>추천할 메뉴가 없어요</Text>
            <Text style={styles.emptyDesc}>잠시 후 다시 시도해보세요.</Text>
          </View>
        ) : (
          <View style={styles.recommendContent}>
            <FeaturedRecipeCarousel
              titleLabel="추천 메뉴"
              description="보유하고 계신 식재료 기반으로 메뉴 4가지를 추천합니다."
              items={recommendCarouselItems}
              onPressItem={handlePressRecipeItem}
              heroImageHeight={280}
            />
            <View style={styles.refetchBtnWrap}>
              <Pressable
                style={styles.refetchBtn}
                onPress={() => refetchRecommendations()}
                disabled={isRecommendRefetching}
              >
                <Ionicons name="refresh" size={18} color="#111" />
                <Text style={styles.refetchBtnText}>
                  {isRecommendRefetching
                    ? "불러오는 중..."
                    : "다른 추천 요리 불러오기"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
        {loadingModal}
        {previewModal}
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <PageHeader title={title} />

      {mode === "log" ? (
        isLogLoading && !savedRecipes ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator size="large" color={colors.BLACK} />
            <Text style={styles.emptyDesc}>요리 기록을 불러오는 중...</Text>
          </View>
        ) : logError && !savedRecipes ? (
          <QueryErrorView
            error={logError}
            hasToken={true}
            onRetry={() => refetchLog()}
          />
        ) : (
          <>
            <View style={styles.search}>
              <Ionicons name="search-outline" size={18} color="#666" />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="요리명·저장일 검색"
                placeholderTextColor="#999"
                style={styles.searchInput}
              />
              {q.length > 0 && (
                <Pressable onPress={() => setQ("")} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={18} color="#999" />
                </Pressable>
              )}
            </View>
            {list.length === 0 ? (
              baseList.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Ionicons name="calendar-outline" size={28} color="#999" />
                  <Text style={styles.emptyTitle}>요리 기록이 비어있어요</Text>
                  <Text style={styles.emptyDesc}>
                    레시피 상세에서 요리 기록에 추가하기를 눌러보세요.
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyWrap}>
                  <Ionicons name="search-outline" size={28} color="#999" />
                  <Text style={styles.emptyTitle}>검색 결과가 없어요</Text>
                  <Text style={styles.emptyDesc}>
                    다른 키워드로 검색해보세요.
                  </Text>
                </View>
              )
            ) : (
              <View style={styles.logListWrap}>
                <RecipeLogList
                  items={featuredItems}
                  onPressItem={handlePressRecipeItem}
                />
              </View>
            )}
          </>
        )
      ) : (
        <>
          <View style={styles.search}>
            <Ionicons name="search-outline" size={18} color="#666" />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="재료/레시피 검색"
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
            {q.length > 0 && (
              <Pressable onPress={() => setQ("")} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </Pressable>
            )}
          </View>

          {featuredItems.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="search-outline" size={28} color="#999" />
              <Text style={styles.emptyTitle}>검색 결과가 없어요</Text>
              <Text style={styles.emptyDesc}>다른 키워드로 검색해보세요.</Text>
            </View>
          ) : (
            <FeaturedRecipeCarousel
              titleLabel="레시피"
              items={featuredItems}
              onPressItem={handlePressRecipeItem}
            />
          )}
        </>
      )}
      {loadingModal}
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
  search: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111" },
  clearBtn: { paddingLeft: 4 },

  logListWrap: { flex: 1, marginTop: 4 },

  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 40,
  },
  emptyTitle: { fontSize: 15, fontWeight: "800", color: "#111" },
  emptyDesc: { fontSize: 12, color: "#777", textAlign: "center" },

  recommendContent: {
    flex: 1,
    paddingTop: 24,
  },
  refetchBtnWrap: {
    flex: 1,
    justifyContent: "center",
  },
  refetchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 12,
    alignSelf: "center",
  },
  refetchBtnText: { fontSize: 14, fontWeight: "700", color: "#111" },

  loadingModal: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },

  // 미리보기 모달
  previewModal: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ededed",
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111",
    flex: 1,
    marginRight: 8,
  },
  previewCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ededed",
    alignItems: "center",
    justifyContent: "center",
  },
  previewBody: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  previewSectionTitle: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "900",
    color: "#111",
  },
  previewBox: {
    borderWidth: 1,
    borderColor: "#ededed",
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  previewIngRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  previewIngName: { flex: 1, fontWeight: "800", color: "#111" },
  previewIngAmount: { fontSize: 13, color: "#666" },
  previewStepRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  previewStepNum: {
    width: 26,
    height: 26,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ededed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  previewStepNumText: { fontWeight: "900", color: "#111", fontSize: 12 },
  previewStepText: { flex: 1, color: "#333", fontWeight: "700", lineHeight: 18 },
  previewTipText: { color: "#333", fontWeight: "600", lineHeight: 20 },
  previewBottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  previewSaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#111",
  },
  previewSaveBtnDisabled: { opacity: 0.6 },
  previewSaveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
});
