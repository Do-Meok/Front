import EmptyIngredientsBanner from "@/components/EmptyIngredientsBanner";
import ExpiringCarousel from "@/components/ExpiringCarousel";
import type { FeaturedRecipe } from "@/components/FeaturedRecipeCarousel";
import FeaturedRecipeCarousel from "@/components/FeaturedRecipeCarousel";
import HomeHeader from "@/components/HomeHeader";
import RecipeLoadingScreen from "@/components/RecipeLoadingScreen";
import { colors } from "@/constants";
import useCreateRecipeDetails from "@/hooks/assistant/useCreateRecipeDetails";
import useGetRecommendationsRecipes from "@/hooks/assistant/useGetRecommendationsRecipes";
import useGetIngredients from "@/hooks/ingredients/useGetIngredients";
import useGetRecipes from "@/hooks/recipes/useGetRecipes";
import useSaveRecipe from "@/hooks/recipes/useSaveRecipe";
import type { GetIngredientResponse, RecipeRecommendationItem } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_H } = Dimensions.get("window");
const HERO_HEIGHT = Math.round(Math.min(280, SCREEN_H * 0.32));

export default function HomeScreen() {
  const {
    data: recommendationsData,
    isLoading: isRecommendLoading,
    error: recommendError,
  } = useGetRecommendationsRecipes();

  const { data: savedRecipes } = useGetRecipes();
  const { data: ingredients = [], isLoading: isIngredientsLoading } =
    useGetIngredients();
  const createRecipeDetailsMutation = useCreateRecipeDetails();
  const saveRecipeMutation = useSaveRecipe();

  // 유통기한 급박한 순으로 정렬하여 상위 5개만 선택
  const expiringItems = useMemo(() => {
    return ingredients
      .filter((item: GetIngredientResponse) => item.expiration_date)
      .sort(
        (a: GetIngredientResponse, b: GetIngredientResponse) =>
          new Date(a.expiration_date!).getTime() -
          new Date(b.expiration_date!).getTime(),
      )
      .slice(0, 5)
      .map((item: GetIngredientResponse) => ({
        id: String(item.id),
        name: item.ingredient_name,
        expiresAt: item.expiration_date!,
      }));
  }, [ingredients]);

  const handlePressRecipeItem = (item: FeaturedRecipe) => {
    const match = item.id.match(/^recommend-(\d+)-/);
    const idx = match ? parseInt(match[1], 10) : -1;
    const payload: RecipeRecommendationItem | null =
      idx >= 0 && recommendationsData?.recipes?.[idx]
        ? recommendationsData.recipes[idx]
        : null;

    if (!payload) {
      router.push(`/recipes/${item.id}?from=home`);
      return;
    }

    const existing = (savedRecipes ?? []).find((r) => r.food === payload.food);
    if (existing) {
      router.push(`/recipes/${existing.id}?from=home`);
      return;
    }

    createRecipeDetailsMutation.mutate(payload, {
      onSuccess: (detail) => {
        saveRecipeMutation.mutate(detail, {
          onSuccess: (saved) => {
            router.push(`/recipes/${saved.id}?from=home`);
          },
        });
      },
    });
  };

  const featuredItems = useMemo((): FeaturedRecipe[] => {
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

  const isRecipeLoading =
    createRecipeDetailsMutation.isPending || saveRecipeMutation.isPending;

  const isInitialLoading =
    (isRecommendLoading && !recommendationsData) || isIngredientsLoading;

  const hasIngredients = ingredients.length > 0;
  const hasRecommendations = featuredItems.length > 0;
  const isRecommendDone = !isRecommendLoading || !!recommendationsData;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <HomeHeader
        onPressBell={() => {}}
        onPressProfile={() => router.push("/mypage")}
      />
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 추천 레시피 영역 */}
        {isRecommendLoading && !recommendationsData ? (
          <View style={styles.recommendLoading}>
            <ActivityIndicator size="small" color={colors.BLACK} />
            <Text style={styles.recommendLoadingText}>추천 불러오는 중...</Text>
          </View>
        ) : recommendError && !recommendationsData ? (
          <View style={styles.recommendLoading}>
            <Text style={styles.recommendLoadingText}>
              추천을 불러올 수 없어요
            </Text>
          </View>
        ) : hasRecommendations ? (
          <FeaturedRecipeCarousel
            titleLabel="오늘의 추천"
            items={featuredItems}
            onPressItem={handlePressRecipeItem}
            heroImageHeight={HERO_HEIGHT}
          />
        ) : null}

        {/* 재료도 없고 추천도 없을 때 → 재료 추가 유도 */}
        {!isInitialLoading && !hasIngredients && !hasRecommendations && (
          <EmptyIngredientsBanner />
        )}

        {/* 재료는 있는데 추천이 아직 없을 때 → AI 추천 유도 */}
        {!isInitialLoading &&
          isRecommendDone &&
          hasIngredients &&
          !hasRecommendations && (
            <Pressable
              style={styles.aiCtaCard}
              onPress={() => router.push("/(tabs)/recipes/recommend" as any)}
            >
              <View style={styles.aiCtaIconBox}>
                <Ionicons name="sparkles" size={28} color="#f59e0b" />
              </View>
              <View style={styles.aiCtaTextBox}>
                <Text style={styles.aiCtaTitle}>
                  AI를 통해 추천받아보시겠어요?
                </Text>
                <Text style={styles.aiCtaDesc}>
                  보유 재료 기반으로 맞춤 레시피를 추천해드려요.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#bbb" />
            </Pressable>
          )}

        {/* 유통기한 마감 */}
        {expiringItems.length > 0 && (
          <ExpiringCarousel items={expiringItems} onPressItem={() => {}} />
        )}
      </ScrollView>

      {/* 초기 데이터 로딩 화면 */}
      <Modal visible={isInitialLoading} transparent animationType="fade">
        <View style={styles.loadingModal}>
          <RecipeLoadingScreen message="데이터를 불러오는 중입니다..." />
        </View>
      </Modal>

      {/* 레시피 상세 정보 로딩 화면 */}
      <Modal visible={isRecipeLoading} transparent animationType="fade">
        <View style={styles.loadingModal}>
          <RecipeLoadingScreen message="레시피를 받아오는 중입니다." />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  page: {
    flex: 1,
    marginTop: 10,
  },
  pageContent: {
    gap: 28,
    paddingBottom: 24,
  },
  recommendLoading: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 8,
  },
  recommendLoadingText: {
    fontSize: 13,
    color: "#777",
  },

  /* AI 추천 유도 카드 */
  aiCtaCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#f3e8c4",
    backgroundColor: "#fffbeb",
    gap: 12,
  },
  aiCtaIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
  aiCtaTextBox: {
    flex: 1,
    gap: 3,
  },
  aiCtaTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.BLACK,
  },
  aiCtaDesc: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.INACTIVE,
  },

  loadingModal: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
});
