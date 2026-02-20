import QueryErrorView from "@/components/QueryErrorView";
import RecipeLoadingScreen from "@/components/RecipeLoadingScreen";
import useSearchRecipesByName from "@/hooks/assistant/useSearchRecipesByName";
import useSaveRecipe from "@/hooks/recipes/useSaveRecipe";
import type { RecipeDetailResponse } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function RecipeDetailContent({ detail }: { detail: RecipeDetailResponse }) {
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

export default function RecipesIndexScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: recipe, isLoading, error, refetch } = useSearchRecipesByName(
    searchTerm.trim()
  );
  const saveRecipeMutation = useSaveRecipe();

  const handleSearch = () => {
    Keyboard.dismiss();
    const trimmed = query.trim();
    if (trimmed) {
      setSearchTerm(trimmed);
    }
  };

  const hasSearched = searchTerm.length > 0;
  const showGuide = !hasSearched && !query.trim();

  return (
    <View style={[styles.page, { paddingTop: insets.top + 14 }]}>
      <View style={styles.searchSection}>
        <View style={styles.search}>
          <Ionicons name="search-outline" size={18} color="#666" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="요리명 검색 (예: 김치찌개, 된장찌개)"
            placeholderTextColor="#999"
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={handleSearch}
          style={[styles.searchBtn, !query.trim() && styles.searchBtnDisabled]}
          disabled={!query.trim()}
        >
          <Text style={styles.searchBtnText}>검색</Text>
        </Pressable>
      </View>

      {showGuide && (
        <View style={styles.guideWrap}>
          <Ionicons name="book-outline" size={36} color="#ccc" />
          <Text style={styles.guideTitle}>정석 레시피를 찾아드려요</Text>
          <Text style={styles.guideDesc}>
            검색창에 원하는 요리명을 입력하면{"\n"}
            해당 요리의 정석 레시피를 알려드립니다.
          </Text>
        </View>
      )}

      {hasSearched && (
        <>
          {isLoading ? (
            <RecipeLoadingScreen message="레시피를 찾고 있어요." />
          ) : error ? (
            <QueryErrorView
              error={error}
              hasToken={true}
              onRetry={() => refetch()}
            />
          ) : !recipe ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="document-text-outline" size={40} color="#999" />
              <Text style={styles.emptyTitle}>레시피를 찾을 수 없어요</Text>
              <Text style={styles.emptyDesc}>
                {searchTerm}에 대한 검색 결과가 없습니다.{"\n"}
                다른 요리명으로 검색해보세요.
              </Text>
            </View>
          ) : (
            <>
              <RecipeDetailContent detail={recipe} />
              <Pressable
                onPress={() =>
                  saveRecipeMutation.mutate(recipe, {
                    onSuccess: () =>
                      Alert.alert("저장됨", "요리 기록에 추가되었습니다."),
                  })
                }
                style={[
                  styles.saveToLogBtn,
                  saveRecipeMutation.isPending && styles.saveToLogBtnDisabled,
                ]}
                disabled={saveRecipeMutation.isPending}
              >
                <Ionicons name="calendar-outline" size={20} color="#fff" />
                <Text style={styles.saveToLogBtnText}>
                  {saveRecipeMutation.isPending
                    ? "저장 중..."
                    : "요리 기록에 저장"}
                </Text>
              </Pressable>
            </>
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

  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  search: {
    flex: 1,
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
  searchBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#111",
  },
  searchBtnDisabled: { backgroundColor: "#ccc" },
  searchBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },
  guideWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 32,
  },
  guideTitle: { fontSize: 17, fontWeight: "800", color: "#333" },
  guideDesc: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    lineHeight: 22,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#111" },
  emptyDesc: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  detailContent: { paddingTop: 20, paddingBottom: 32 },
  saveToLogBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: "#111",
  },
  saveToLogBtnDisabled: { opacity: 0.6 },
  saveToLogBtnText: { fontSize: 15, fontWeight: "800", color: "#fff" },
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
