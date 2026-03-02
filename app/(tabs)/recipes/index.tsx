import QueryErrorView from "@/components/QueryErrorView";
import RecipeDetailContent from "@/components/RecipeDetailContent";
import RecipeLoadingScreen from "@/components/RecipeLoadingScreen";
import { colors } from "@/constants";
import useSearchRecipesByName from "@/hooks/assistant/useSearchRecipesByName";
import useSaveRecipe from "@/hooks/recipes/useSaveRecipe";
import { useNavigationContext } from "@/providers/NavigationProvider";
import { useTutorial, type TutorialStep } from "@/providers/TutorialProvider";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const RECIPE_TUTORIAL_STEPS: TutorialStep[] = [
  {
    description: "레시피 탭이에요.\n다양한 방법으로 레시피를 찾을 수 있어요.",
  },
  {
    targetId: "recipe-search",
    description: "요리명을 검색하면 정석 레시피를 알려드려요.\n(예: 김치찌개, 된장찌개)",
  },
  {
    targetId: "tab-bar",
    description: "AI 추천 탭에서 냉장고 재료 기반 맞춤 레시피를,\n요리 기록 탭에서 기록을 확인해보세요.",
  },
];

export default function RecipesIndexScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: recipe,
    isLoading,
    error,
    refetch,
  } = useSearchRecipesByName(searchTerm.trim());
  const saveRecipeMutation = useSaveRecipe();

  // 튜토리얼 refs
  const searchRef = useRef<View>(null);
  const { registerTarget, unregisterTarget, startTutorialIfNeeded } = useTutorial();
  const { hasToken } = useNavigationContext();

  useEffect(() => {
    registerTarget("recipe-search", searchRef);
    return () => unregisterTarget("recipe-search");
  }, [registerTarget, unregisterTarget]);

  useFocusEffect(
    useCallback(() => {
      if (!hasToken) return;
      startTutorialIfNeeded("recipes", RECIPE_TUTORIAL_STEPS);
    }, [startTutorialIfNeeded, hasToken])
  );

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
      <View ref={searchRef} style={styles.searchSection}>
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
    backgroundColor: colors.PRIMARY,
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
    backgroundColor: colors.PRIMARY,
  },
  saveToLogBtnDisabled: { opacity: 0.6 },
  saveToLogBtnText: { fontSize: 15, fontWeight: "800", color: "#fff" },
});
