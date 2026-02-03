import FeaturedRecipeCarousel, {
    type FeaturedRecipe,
} from "@/components/FeaturedRecipeCarousel";
import PageHeader from "@/components/PageHeader";
import QueryErrorView from "@/components/QueryErrorView";
import { colors } from "@/constants";
import useGetRecommendationsRecipes from "@/hooks/assistant/useGetRecommendationsRecipes";
import { getSecureStore } from "@/utils/secureStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
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

  const {
    data: recommendationsData,
    isLoading: isRecommendLoading,
    error: recommendError,
    refetch: refetchRecommendations,
    isRefetching: isRecommendRefetching,
  } = useGetRecommendationsRecipes();

  useEffect(() => {
    if (mode === "recommend") {
      getSecureStore("accessToken").then((token) => setHasToken(!!token));
    }
  }, [mode]);

  const baseList = useMemo(() => {
    if (mode === "log") return [];
    if (mode === "recommend") return [];
    return MOCK_RECIPES;
  }, [mode]);

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

  const featuredItems = useMemo(() => {
    return list.map((r) => ({
      id: r.id,
      title: r.title,
      desc: r.desc,
      image: r.image,
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

  if (mode === "recommend") {
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
            <Text style={styles.emptyDesc}>
              식재료를 등록하면 맞춤 추천을 받을 수 있어요.
            </Text>
          </View>
        ) : (
          <View style={styles.recommendContent}>
            <FeaturedRecipeCarousel
              titleLabel="추천 메뉴"
              items={recommendCarouselItems}
              onPressItem={(item) => router.push(`/recipes/${item.id}`)}
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
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <PageHeader title={title} />

      {mode === "log" ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="calendar-outline" size={28} color="#999" />
          <Text style={styles.emptyTitle}>요리 기록이 비어있어요</Text>
          <Text style={styles.emptyDesc}>
            레시피 상세에서 “요리 기록에 추가하기”를 눌러보세요.
          </Text>
        </View>
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
              onPressItem={(item) => router.push(`/recipes/${item.id}`)}
            />
          )}
        </>
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
});
