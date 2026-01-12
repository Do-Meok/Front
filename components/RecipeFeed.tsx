import FeaturedRecipeCarousel from "@/components/FeaturedRecipeCarousel";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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

  const baseList = useMemo(() => {
    if (mode === "log") return [];
    if (mode === "recommend")
      return [...MOCK_RECIPES].sort((a, b) => b.rating - a.rating);
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
      imageUri: r.image,
    }));
  }, [list]);

  const title =
    mode === "recommend"
      ? "레시피 추천"
      : mode === "log"
        ? "요리 기록"
        : "레시피";

  return (
    <View style={styles.page}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* 요리 기록은 검색/목록 대신 빈 상태만 */}
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
          {/* 검색바 */}
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

          {/* 내용 */}
          {featuredItems.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="search-outline" size={28} color="#999" />
              <Text style={styles.emptyTitle}>검색 결과가 없어요</Text>
              <Text style={styles.emptyDesc}>다른 키워드로 검색해보세요.</Text>
            </View>
          ) : (
            <FeaturedRecipeCarousel
              titleLabel={mode === "recommend" ? "추천 메뉴" : "레시피"}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 20, fontWeight: "800" },

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
});
