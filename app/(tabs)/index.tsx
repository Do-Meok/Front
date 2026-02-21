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
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_H } = Dimensions.get("window");
// 기기 높이에 따라 히어로 이미지 높이 조정 (소형 기기 대응)
const HERO_HEIGHT = Math.round(Math.min(280, SCREEN_H * 0.32));

export default function HomeScreen() {
  const {
    data: recommendationsData,
    isLoading: isRecommendLoading,
    error: recommendError,
  } = useGetRecommendationsRecipes();

  const { data: savedRecipes } = useGetRecipes();
  const { data: ingredients = [], isLoading: isIngredientsLoading } = useGetIngredients();
  const createRecipeDetailsMutation = useCreateRecipeDetails();
  const saveRecipeMutation = useSaveRecipe();

  // 유통기한 급박한 순으로 정렬하여 상위 5개만 선택
  const expiringItems = useMemo(() => {
    return ingredients
      .filter((item: GetIngredientResponse) => item.expiration_date) // 유통기한이 있는 것만
      .sort((a: GetIngredientResponse, b: GetIngredientResponse) => {
        // 유통기한 오름차순 정렬 (가장 급박한 것이 먼저)
        return (
          new Date(a.expiration_date!).getTime() -
          new Date(b.expiration_date!).getTime()
        );
      })
      .slice(0, 5) // 상위 5개만
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

  // 초기 데이터 로딩 상태 (추천 레시피 + 재료 목록)
  const isInitialLoading = (isRecommendLoading && !recommendationsData) || isIngredientsLoading;

  return (
    <SafeAreaView style={styles.container}>
      <HomeHeader
        onPressBell={() => { }}
        onPressProfile={() => router.push("/mypage")}
      />
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 오늘의 추천 (보유 식재료 기반, 레시피 추천과 동일 API) */}
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
        ) : featuredItems.length > 0 ? (
          <FeaturedRecipeCarousel
            titleLabel="오늘의 추천"
            items={featuredItems}
            onPressItem={handlePressRecipeItem}
            heroImageHeight={HERO_HEIGHT}
          />
        ) : null}

        {/* 유통기한 마감 */}
        {expiringItems.length > 0 && (
          <ExpiringCarousel
            items={expiringItems}
            onPressItem={(item) => {
              // 예: 해당 재료로 레시피 추천 화면 이동
              // router.push(`/recipes?ingredient=${encodeURIComponent(item.name)}`)
            }}
          />
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

  writeButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#ff5e08ff",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    shadowOpacity: 0.5,
    elevation: 2,
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
  loadingModal: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
});
