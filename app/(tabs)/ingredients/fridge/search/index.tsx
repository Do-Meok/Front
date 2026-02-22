import { getCompartmentIngredients } from "@/api/refrigerator";
import PageHeader from "@/components/PageHeader";
import { queryKey } from "@/constants";
import useGetRefrigerator from "@/hooks/refrigerator/useGetRefrigerator";
import { useFridgeContext } from "@/providers/FridgeProvider";
import type { Compartment, CompartmentIngredient } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useQueries } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function FridgeSearchScreen() {
  const { fridges, localAssignments } = useFridgeContext();
  const [query, setQuery] = useState("");

  // 첫 번째 냉장고 사용 (추후 선택 가능)
  const currentFridge = fridges[0];
  const currentApiId = currentFridge?.apiId ?? null;

  const { data: refrigerator, isLoading: isLoadingFridge } =
    useGetRefrigerator(currentApiId);

  // 칸을 order_index로 정렬
  const sortedCompartments = useMemo(() => {
    if (!refrigerator?.compartments) return [];
    return [...refrigerator.compartments].sort(
      (a, b) => a.order_index - b.order_index,
    );
  }, [refrigerator]);

  // 모든 칸의 재료를 병렬로 조회
  const compartmentQueries = useQueries({
    queries: sortedCompartments.map((comp) => ({
      queryKey: [queryKey.COMPARTMENT_INGREDIENTS, comp.id],
      queryFn: () => getCompartmentIngredients(comp.id),
      staleTime: 1000 * 60 * 2,
    })),
  });

  // compartmentId -> 재료 목록 맵 (API + 로컬 병합)
  const ingredientsByCompartment = useMemo(() => {
    const map = new Map<number, CompartmentIngredient[]>();
    sortedCompartments.forEach((comp, idx) => {
      const apiData = compartmentQueries[idx]?.data ?? [];
      const localData = localAssignments[comp.id] ?? [];
      if (apiData.length > 0 || localData.length > 0) {
        map.set(comp.id, [...apiData, ...localData]);
      }
    });
    return map;
  }, [sortedCompartments, compartmentQueries, localAssignments]);

  // 그리드 데이터
  const gridData = useMemo(() => {
    if (!refrigerator) return [];
    const cols = refrigerator.pos_x || 1;
    const rowCount = refrigerator.pos_y || 1;
    const rows: (Compartment | null)[][] = [];
    for (let r = 0; r < rowCount; r++) {
      const row: (Compartment | null)[] = [];
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        row.push(sortedCompartments[idx] ?? null);
      }
      rows.push(row);
    }
    return rows;
  }, [refrigerator, sortedCompartments]);

  // 검색어에 매칭되는 칸 ID 목록 + 매칭 결과
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { matchedCompartmentIds: new Set<number>(), results: [] };

    const matchedCompartmentIds = new Set<number>();
    const results: {
      compartment: Compartment;
      ingredients: CompartmentIngredient[];
    }[] = [];

    sortedCompartments.forEach((comp) => {
      const ingredients = ingredientsByCompartment.get(comp.id) ?? [];
      const matched = ingredients.filter((ing) =>
        ing.ingredient_name.toLowerCase().includes(q),
      );
      if (matched.length > 0) {
        matchedCompartmentIds.add(comp.id);
        results.push({ compartment: comp, ingredients: matched });
      }
    });

    return { matchedCompartmentIds, results };
  }, [query, sortedCompartments, ingredientsByCompartment]);

  const hasQuery = query.trim().length > 0;

  return (
    <View style={styles.page}>
      <PageHeader
        title="위치 찾기"
        leftChild={
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>
        }
      />

      {/* 검색바 */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="식재료명으로 검색 (예: 우유)"
          placeholderTextColor="#999"
          style={styles.searchInput}
          autoFocus
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={20} color="#ccc" />
          </Pressable>
        )}
      </View>

      {isLoadingFridge ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111" />
          <Text style={styles.loadingText}>냉장고 정보를 불러오는 중...</Text>
        </View>
      ) : !refrigerator ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>
            냉장고 정보를 불러올 수 없습니다.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* 냉장고 그리드 */}
          <View style={styles.gridContainer}>
            <View style={styles.gridInner}>
              {gridData.map((row, rIdx) => (
                <View key={rIdx} style={styles.gridRow}>
                  {row.map((comp, cIdx) => {
                    const isMatched =
                      comp !== null &&
                      hasQuery &&
                      searchResults.matchedCompartmentIds.has(comp.id);
                    return (
                      <View
                        key={comp?.id ?? `empty-${rIdx}-${cIdx}`}
                        style={[
                          styles.gridCell,
                          !comp && styles.gridCellEmpty,
                          isMatched && styles.gridCellMatched,
                        ]}
                      >
                        {comp && (
                          <>
                            <Text
                              style={[
                                styles.gridCellTitle,
                                isMatched && styles.gridCellTitleMatched,
                              ]}
                              numberOfLines={1}
                            >
                              {comp.name}
                            </Text>
                            {isMatched && (
                              <Ionicons
                                name="checkmark-circle"
                                size={18}
                                color="#22c55e"
                              />
                            )}
                          </>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
            <Text style={styles.gridDesc}>
              {refrigerator.pos_x} × {refrigerator.pos_y} (
              {sortedCompartments.length}칸)
            </Text>
          </View>

          {/* 검색 결과 */}
          {hasQuery && (
            <View style={styles.resultsSection}>
              {searchResults.results.length === 0 ? (
                <View style={styles.noResult}>
                  <Ionicons name="search-outline" size={36} color="#ddd" />
                  <Text style={styles.noResultText}>
                    {`"${query}"에 맞는 식재료를 찾을 수 없습니다.`}
                  </Text>
                </View>
              ) : (
                searchResults.results.map(({ compartment, ingredients }) => (
                  <View key={compartment.id} style={styles.resultCard}>
                    <View style={styles.resultHeader}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#22c55e"
                      />
                      <Text style={styles.resultHeaderText}>
                        {ingredients
                          .map((i) => `"${i.ingredient_name}"`)
                          .join(", ")}
                        은(는){" "}
                        <Text style={styles.resultCompartmentName}>
                          {compartment.name}
                        </Text>
                        에 있습니다
                      </Text>
                    </View>
                    <View style={styles.resultIngredients}>
                      {ingredients.map((ing) => (
                        <View key={ing.id} style={styles.resultIngredientRow}>
                          <Text style={styles.resultIngredientName}>
                            {ing.ingredient_name}
                          </Text>
                          {ing.expiration_date && (
                            <Text style={styles.resultMeta}>
                              유통: {ing.expiration_date}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* 검색 전 힌트 */}
          {!hasQuery && (
            <View style={styles.hintSection}>
              <Ionicons name="bulb-outline" size={24} color="#ccc" />
              <Text style={styles.hintText}>
                식재료 이름을 입력하면{"\n"}해당 식재료가 어느 칸에 있는지
                표시됩니다.
              </Text>
            </View>
          )}
        </ScrollView>
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
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    marginTop: 12,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 4,
    color: "#111",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: "#888",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
  },
  // 그리드
  gridContainer: {
    alignItems: "center",
    backgroundColor: "#f7f8fa",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  gridInner: {
    gap: 8,
  },
  gridRow: {
    flexDirection: "row",
    gap: 8,
  },
  gridCell: {
    width: 76,
    height: 76,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#dde0e8",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  gridCellEmpty: {
    backgroundColor: "#f0f1f3",
    borderStyle: "dashed" as const,
    borderColor: "#ccc",
  },
  gridCellMatched: {
    borderColor: "#22c55e",
    backgroundColor: "#f0fdf4",
    borderWidth: 2.5,
  },
  gridCellTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#333",
    textAlign: "center" as const,
    marginBottom: 2,
  },
  gridCellTitleMatched: {
    color: "#16a34a",
  },
  gridDesc: {
    textAlign: "center" as const,
    marginTop: 12,
    fontSize: 13,
    color: "#999",
    fontWeight: "600",
  },
  // 결과
  resultsSection: {
    marginTop: 16,
  },
  noResult: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 10,
  },
  noResultText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center" as const,
  },
  resultCard: {
    borderWidth: 1,
    borderColor: "#d4edda",
    borderRadius: 14,
    backgroundColor: "#f0fdf4",
    padding: 14,
    marginBottom: 10,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  resultHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    flex: 1,
  },
  resultCompartmentName: {
    color: "#16a34a",
    fontWeight: "900",
  },
  resultIngredients: {
    gap: 4,
    paddingLeft: 26,
  },
  resultIngredientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  resultIngredientName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
  },
  resultMeta: {
    fontSize: 11,
    color: "#999",
  },
  // 힌트
  hintSection: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  hintText: {
    fontSize: 13,
    color: "#bbb",
    textAlign: "center" as const,
    lineHeight: 20,
  },
});
