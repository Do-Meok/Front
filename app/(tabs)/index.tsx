import ExpiringCarousel from "@/components/ExpiringCarousel";
import type { FeaturedRecipe } from "@/components/FeaturedRecipeCarousel";
import FeaturedRecipeCarousel from "@/components/FeaturedRecipeCarousel";
import HomeHeader from "@/components/HomeHeader";
import RecipeLoadingScreen from "@/components/RecipeLoadingScreen";
import { colors } from "@/constants";
import useCreateRecipeDetails from "@/hooks/assistant/useCreateRecipeDetails";
import useGetRecommendationsRecipes from "@/hooks/assistant/useGetRecommendationsRecipes";
import useSaveRecipe from "@/hooks/recipes/useSaveRecipe";
import type { RecipeRecommendationItem } from "@/types";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const expiring = [
  { id: "1", name: "우유", expiresAt: "2026-01-31" },
  { id: "2", name: "양파", expiresAt: "2026-01-02" },
  { id: "3", name: "두부", expiresAt: "2026-01-30" },
  { id: "4", name: "달걀", expiresAt: "2026-02-01" },
];

export default function HomeScreen() {
  const {
    data: recommendationsData,
    isLoading: isRecommendLoading,
    error: recommendError,
  } = useGetRecommendationsRecipes();

  const createRecipeDetailsMutation = useCreateRecipeDetails();
  const saveRecipeMutation = useSaveRecipe();

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

  return (
    <SafeAreaView style={styles.container}>
      <HomeHeader
        onPressBell={() => {}}
        onPressProfile={() => router.push("/mypage")}
      />
      <View style={styles.page}>
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
            heroImageHeight={280}
          />
        ) : null}

        {/* 유통기한 마감 */}
        <ExpiringCarousel
          items={expiring}
          onPressItem={(item) => {
            // 예: 해당 재료로 레시피 추천 화면 이동
            // router.push(`/recipes?ingredient=${encodeURIComponent(item.name)}`)
          }}
        />
      </View>

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
    gap: 45,
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
