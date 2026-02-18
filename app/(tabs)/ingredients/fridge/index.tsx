import { getCompartmentIngredients } from "@/api/refrigerator";
import PageHeader from "@/components/PageHeader";
import { queryKey } from "@/constants";
import useGetIngredients from "@/hooks/ingredients/useGetIngredients";
import useGetCompartmentIngredients from "@/hooks/refrigerator/useGetCompartmentIngredients";
import useGetRefrigerator from "@/hooks/refrigerator/useGetRefrigerator";
import { useFridgeContext } from "@/providers/FridgeProvider";
import type { Compartment, CompartmentIngredient } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useQueries } from "@tanstack/react-query";
import { type Href, router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";



export default function FridgeScreen() {
  const { fridges, localAssignments, addLocalAssignment } = useFridgeContext();
  const [selectedFridgeIdx, setSelectedFridgeIdx] = useState(0);
  const [fridgePickerOpen, setFridgePickerOpen] = useState(false);
  const [selectedCompartment, setSelectedCompartment] =
    useState<Compartment | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  // 현재 선택된 냉장고
  const currentFridge = fridges[selectedFridgeIdx] ?? fridges[0];
  const currentApiId = currentFridge?.apiId ?? null;

  // 냉장고 데이터 조회
  const {
    data: refrigerator,
    isLoading: isLoadingFridge,
    error: fridgeError,
  } = useGetRefrigerator(currentApiId);

  // 유저의 전체 식재료 목록
  const { data: allIngredients, isLoading: isLoadingAllIngredients } =
    useGetIngredients();

  // 선택된 칸의 재료 조회
  const {
    data: compartmentIngredients,
    isLoading: isLoadingIngredients,
    refetch: refetchIngredients,
  } = useGetCompartmentIngredients(selectedCompartment?.id ?? null);

  // 칸을 order_index로 정렬
  const sortedCompartments = useMemo(() => {
    if (!refrigerator?.compartments) return [];
    return [...refrigerator.compartments].sort(
      (a, b) => a.order_index - b.order_index
    );
  }, [refrigerator]);

  // 고정된 hook 순서 — sortedCompartments는 refrigerator 변경 시만 바뀌뮼로 안정적
  // 모든 칸의 재료를 병렬로 조회
  const compartmentQueries = useQueries({
    queries: sortedCompartments.map((comp) => ({
      queryKey: [queryKey.COMPARTMENT_INGREDIENTS, comp.id],
      queryFn: () => getCompartmentIngredients(comp.id),
      staleTime: 1000 * 60 * 2, // 2분 캐시
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

  // 그리드 데이터: pos_x × pos_y 크기의 그리드에 compartment 매핑
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

  const handleCompartmentPress = (compartment: Compartment) => {
    setSelectedCompartment(compartment);
  };

  const handleCloseBottomSheet = () => {
    setSelectedCompartment(null);
  };

  const handleAddIngredient = () => {
    setPickerSearch("");
    setAddModalVisible(true);
  };

  // 피커에서 검색 필터된 식재료 목록
  const filteredIngredients = useMemo(() => {
    if (!allIngredients) return [];
    // 이미 해당 칸에 있는 재료 ID 목록 (API + 로컬)
    const existingIds = new Set([
      ...(compartmentIngredients ?? []).map((ci) => ci.id),
      ...(selectedCompartment
        ? (localAssignments[selectedCompartment.id] ?? []).map((li) => li.id)
        : []),
    ]);
    const list = allIngredients.filter(
      (ing) => !existingIds.has(ing.id)
    );
    if (!pickerSearch.trim()) return list;
    return list.filter((ing) =>
      ing.ingredient_name
        .toLowerCase()
        .includes(pickerSearch.trim().toLowerCase())
    );
  }, [allIngredients, compartmentIngredients, localAssignments, selectedCompartment, pickerSearch]);
  const renderIngredientItem = ({
    item,
  }: {
    item: CompartmentIngredient;
  }) => {
    const isExpiringSoon = item.expiration_date
      ? new Date(item.expiration_date).getTime() - Date.now() <
      3 * 24 * 60 * 60 * 1000
      : false;
    const isExpired = item.expiration_date
      ? new Date(item.expiration_date) < new Date()
      : false;

    return (
      <View style={styles.ingredientCard}>
        <View style={styles.ingredientInfo}>
          <Text style={styles.ingredientName}>{item.ingredient_name}</Text>
          <View style={styles.ingredientMeta}>
            {item.purchase_date && (
              <Text style={styles.metaText}>
                구입: {item.purchase_date}
              </Text>
            )}
            {item.expiration_date && (
              <Text
                style={[
                  styles.metaText,
                  isExpired && styles.expiredText,
                  isExpiringSoon && !isExpired && styles.expiringSoonText,
                ]}
              >
                유통기한: {item.expiration_date}
                {isExpired ? " (만료)" : isExpiringSoon ? " (임박)" : ""}
              </Text>
            )}
          </View>
        </View>
        {item.storage_type && (
          <View
            style={[
              styles.storageTag,
              item.storage_type === "FREEZER" && styles.storageTagFreezer,
              item.storage_type === "ROOM" && styles.storageTagRoom,
            ]}
          >
            <Text style={styles.storageTagText}>
              {item.storage_type === "FRIDGE"
                ? "냉장"
                : item.storage_type === "FREEZER"
                  ? "냉동"
                  : "실온"}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.page}>
      <PageHeader title="냉장고 관리" />

      {/* 냉장고 선택 토글 */}
      <Pressable
        style={styles.fridgeSelector}
        onPress={() => setFridgePickerOpen((v) => !v)}
      >
        <View style={styles.fridgeSelectorLeft}>
          <Ionicons name="cube-outline" size={20} color="#111" />
          <Text style={styles.fridgeName}>
            {currentFridge?.name ?? "냉장고 없음"}
          </Text>
        </View>
        <Ionicons
          name={fridgePickerOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color="#888"
        />
      </Pressable>

      {/* 냉장고 드롭다운 목록 */}
      {fridgePickerOpen && (
        <View style={styles.fridgeDropdown}>
          {fridges.map((fridge, idx) => (
            <Pressable
              key={fridge.id}
              style={[
                styles.fridgeDropdownItem,
                idx === selectedFridgeIdx && styles.fridgeDropdownItemActive,
              ]}
              onPress={() => {
                setSelectedFridgeIdx(idx);
                setSelectedCompartment(null);
                setFridgePickerOpen(false);
              }}
            >
              <Text
                style={[
                  styles.fridgeDropdownText,
                  idx === selectedFridgeIdx && styles.fridgeDropdownTextActive,
                ]}
              >
                {fridge.name}
              </Text>
              <Text style={styles.fridgeDropdownDim}>
                {fridge.cols}×{fridge.rows}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* 액션 버튼 - 항상 표시 */}
      <View style={styles.actionRow}>
        <Pressable
          style={styles.actionBtn}
          onPress={() =>
            router.push("/ingredients/fridge/add-fridge" as Href)
          }
        >
          <Ionicons name="add" size={18} color="#111" />
          <Text style={styles.actionBtnText}>냉장고 추가</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() =>
            router.push("/ingredients/fridge/search" as Href)
          }
        >
          <Ionicons name="search" size={18} color="#111" />
          <Text style={styles.actionBtnText}>위치 찾기</Text>
        </Pressable>
      </View>

      {/* 로딩 상태 */}
      {isLoadingFridge ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#111" />
          <Text style={styles.loadingText}>냉장고 정보를 불러오는 중...</Text>
        </View>
      ) : fridgeError ? (
        /* 에러 상태 */
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
          <Text style={styles.errorText}>
            냉장고 정보를 불러올 수 없습니다.
          </Text>
          <Text style={styles.errorSubText}>
            네트워크 연결을 확인해주세요.
          </Text>
        </View>
      ) : (
        /* 냉장고 칸 그리드 */
        <ScrollView
          style={styles.compartmentList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridScrollContent}
        >
          {gridData.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="file-tray-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>등록된 칸이 없습니다.</Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              <View style={styles.gridInner}>
                {gridData.map((row, rIdx) => (
                  <View key={rIdx} style={styles.gridRow}>
                    {row.map((comp, cIdx) => {
                      const isSelected =
                        comp !== null &&
                        selectedCompartment?.id === comp.id;
                      const ingredients = comp
                        ? ingredientsByCompartment.get(comp.id) ?? []
                        : [];
                      const hasExpiring = ingredients.some(
                        (ing) =>
                          ing.expiration_date &&
                          new Date(ing.expiration_date).getTime() - Date.now() <
                          3 * 24 * 60 * 60 * 1000
                      );
                      return (
                        <Pressable
                          key={comp?.id ?? `empty-${rIdx}-${cIdx}`}
                          style={({ pressed }) => [
                            styles.gridCell,
                            isSelected && styles.gridCellSelected,
                            pressed && comp && styles.gridCellPressed,
                            !comp && styles.gridCellEmpty,
                            hasExpiring && !isSelected && styles.gridCellExpiring,
                          ]}
                          onPress={
                            comp
                              ? () => handleCompartmentPress(comp)
                              : undefined
                          }
                          disabled={!comp}
                        >
                          {comp && (
                            <>
                              <Text
                                style={[
                                  styles.gridCellTitle,
                                  isSelected && styles.gridCellTitleSelected,
                                ]}
                                numberOfLines={1}
                              >
                                {comp.name}
                              </Text>
                              {ingredients.length > 0 ? (
                                <>
                                  <Text style={styles.gridCellCount}>
                                    {ingredients.length}개
                                  </Text>
                                  <Text
                                    style={styles.gridCellIngredients}
                                    numberOfLines={2}
                                  >
                                    {ingredients
                                      .slice(0, 3)
                                      .map((i) => i.ingredient_name)
                                      .join(", ")}
                                  </Text>
                                </>
                              ) : (
                                <Text style={styles.gridCellEmptyLabel}>
                                  비어있음
                                </Text>
                              )}
                            </>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>
              <Text style={styles.gridDesc}>
                {refrigerator?.pos_x ?? 0} × {refrigerator?.pos_y ?? 0} ({sortedCompartments.length}칸)
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* 칸 선택 시 하단 바텀시트 모달 */}
      <Modal
        visible={selectedCompartment !== null}
        transparent
        animationType="slide"
        onRequestClose={handleCloseBottomSheet}
      >
        <Pressable
          style={styles.bottomSheetBackdrop}
          onPress={handleCloseBottomSheet}
        />
        <View style={styles.bottomSheet}>
          {/* 헤더 */}
          <View style={styles.bottomSheetHeader}>
            <View style={styles.bottomSheetHandle} />
            <View style={styles.bottomSheetTitleRow}>
              <Text style={styles.bottomSheetTitle}>
                {selectedCompartment?.name ?? ""}
              </Text>
              <Pressable
                onPress={handleCloseBottomSheet}
                style={styles.closeSheetBtn}
              >
                <Ionicons name="close" size={22} color="#666" />
              </Pressable>
            </View>
          </View>

          {/* 재료 목록 */}
          {isLoadingIngredients ? (
            <View style={styles.sheetLoading}>
              <ActivityIndicator size="small" color="#111" />
              <Text style={styles.loadingText}>재료를 불러오는 중...</Text>
            </View>
          ) : (() => {
            const apiItems = compartmentIngredients ?? [];
            const localItems = selectedCompartment
              ? localAssignments[selectedCompartment.id] ?? []
              : [];
            const merged = [...apiItems, ...localItems];
            if (merged.length === 0) {
              return (
                <View style={styles.sheetEmpty}>
                  <Ionicons
                    name="restaurant-outline"
                    size={40}
                    color="#ddd"
                  />
                  <Text style={styles.sheetEmptyText}>
                    이 칸에 등록된 식재료가 없습니다.
                  </Text>
                </View>
              );
            }
            return (
              <FlatList
                data={merged}
                keyExtractor={(item) => `sheet-${item.id}`}
                renderItem={renderIngredientItem}
                style={styles.ingredientList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 8 }}
              />
            );
          })()}

          {/* 식재료 추가 버튼 */}
          <Pressable
            style={styles.addIngredientBtn}
            onPress={handleAddIngredient}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.addIngredientBtnText}>식재료 추가하기</Text>
          </Pressable>
        </View>
      </Modal>

      {/* 기존 식재료 피커 모달 */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <Pressable
          style={styles.bottomSheetBackdrop}
          onPress={() => setAddModalVisible(false)}
        />
        <View style={styles.pickerSheet}>
          {/* 헤더 */}
          <View style={styles.bottomSheetHeader}>
            <View style={styles.bottomSheetHandle} />
            <View style={styles.bottomSheetTitleRow}>
              <Text style={styles.bottomSheetTitle}>
                식재료 추가 — {selectedCompartment?.name}
              </Text>
              <Pressable
                onPress={() => setAddModalVisible(false)}
                style={styles.closeSheetBtn}
              >
                <Ionicons name="close" size={22} color="#666" />
              </Pressable>
            </View>
          </View>

          {/* 검색바 */}
          <View style={styles.pickerSearchRow}>
            <Ionicons name="search" size={16} color="#999" />
            <TextInput
              style={styles.pickerSearchInput}
              placeholder="식재료 검색..."
              value={pickerSearch}
              onChangeText={setPickerSearch}
              autoFocus
            />
            {pickerSearch.length > 0 && (
              <Pressable onPress={() => setPickerSearch("")}>
                <Ionicons name="close-circle" size={18} color="#ccc" />
              </Pressable>
            )}
          </View>

          {/* 식재료 목록 */}
          {isLoadingAllIngredients ? (
            <View style={styles.sheetLoading}>
              <ActivityIndicator size="small" color="#111" />
              <Text style={styles.loadingText}>재료 목록을 불러오는 중...</Text>
            </View>
          ) : filteredIngredients.length === 0 ? (
            <View style={styles.sheetEmpty}>
              <Ionicons name="search-outline" size={36} color="#ddd" />
              <Text style={styles.sheetEmptyText}>
                {pickerSearch.trim()
                  ? `"${pickerSearch}"에 맞는 식재료가 없습니다.`
                  : "추가할 식재료가 없습니다."}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredIngredients}
              keyExtractor={(item) => String(item.id)}
              style={styles.pickerList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 12 }}
              renderItem={({ item }) => {
                const isExpiringSoon = item.expiration_date
                  ? new Date(item.expiration_date).getTime() - Date.now() <
                  3 * 24 * 60 * 60 * 1000
                  : false;
                const isExpired = item.expiration_date
                  ? new Date(item.expiration_date) < new Date()
                  : false;
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.pickerItem,
                      pressed && styles.pickerItemPressed,
                    ]}
                    onPress={() => {
                      if (!selectedCompartment) return;
                      Alert.alert(
                        "재료칸에 추가",
                        `"${item.ingredient_name}"을(를) ${selectedCompartment.name}에 추가하시겠습니까?`,
                        [
                          { text: "취소", style: "cancel" },
                          {
                            text: "추가",
                            onPress: () => {
                              const newItem: CompartmentIngredient = {
                                id: item.id,
                                ingredient_name: item.ingredient_name,
                                purchase_date: item.purchase_date,
                                expiration_date: item.expiration_date ?? "",
                                storage_type: item.storage_type ?? "FRIDGE",
                                is_auto_fillable: false,
                              };
                              addLocalAssignment(selectedCompartment.id, newItem);
                              setAddModalVisible(false);
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <View style={styles.pickerItemLeft}>
                      <Text style={styles.pickerItemName}>
                        {item.ingredient_name}
                      </Text>
                      <View style={styles.pickerItemMeta}>
                        {item.purchase_date && (
                          <Text style={styles.pickerMetaText}>
                            구입: {item.purchase_date}
                          </Text>
                        )}
                        {item.expiration_date && (
                          <Text
                            style={[
                              styles.pickerMetaText,
                              isExpired && styles.expiredText,
                              isExpiringSoon &&
                              !isExpired &&
                              styles.expiringSoonText,
                            ]}
                          >
                            유통: {item.expiration_date}
                            {isExpired
                              ? " (만료)"
                              : isExpiringSoon
                                ? " (임박)"
                                : ""}
                          </Text>
                        )}
                      </View>
                    </View>
                    {item.storage_type && (
                      <View
                        style={[
                          styles.storageTag,
                          item.storage_type === "FREEZER" &&
                          styles.storageTagFreezer,
                          item.storage_type === "ROOM" &&
                          styles.storageTagRoom,
                        ]}
                      >
                        <Text style={styles.storageTagText}>
                          {item.storage_type === "FRIDGE"
                            ? "냉장"
                            : item.storage_type === "FREEZER"
                              ? "냉동"
                              : "실온"}
                        </Text>
                      </View>
                    )}
                    <Ionicons
                      name="add-circle-outline"
                      size={22}
                      color="#4A6CF7"
                    />
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

/**
 * AddIngredientModal을 감싸서 compartmentId를 전달하는 래퍼
 * 기존 AddIngredientModal을 재활용하되, 추후 compartment에 직접 넣는 로직 추가 가능
 */
function AddIngredientModalWrapper({
  visible,
  onClose,
  compartmentId,
}: {
  visible: boolean;
  onClose: () => void;
  compartmentId: number | null;
}) {
  // AddIngredientModal을 lazy import 하는 대신 inline으로 간단 구현
  const AddIngredientModal =
    require("@/components/AddIngredientModal").default;
  return <AddIngredientModal visible={visible} onClose={onClose} />;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
  errorText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#555",
    marginTop: 8,
  },
  errorSubText: {
    fontSize: 13,
    color: "#999",
  },
  fridgeSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  fridgeSelectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fridgeName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  fridgeDropdown: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden" as const,
  },
  fridgeDropdownItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  fridgeDropdownItemActive: {
    backgroundColor: "#f0f3ff",
  },
  fridgeDropdownText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  fridgeDropdownTextActive: {
    color: "#4A6CF7",
    fontWeight: "700",
  },
  fridgeDropdownDim: {
    fontSize: 12,
    color: "#999",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  actionBtn: {
    flex: 1,
    minWidth: "30%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111",
  },
  compartmentList: {
    flex: 1,
  },
  gridScrollContent: {
    paddingBottom: 24,
  },
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
    height: 86,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#dde0e8",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  gridCellSelected: {
    borderColor: "#4A6CF7",
    backgroundColor: "#eef1ff",
  },
  gridCellPressed: {
    backgroundColor: "#f0f2f5",
  },
  gridCellEmpty: {
    backgroundColor: "#f0f1f3",
    borderStyle: "dashed" as const,
    borderColor: "#ccc",
  },
  gridCellExpiring: {
    borderColor: "#F5A623",
    backgroundColor: "#fffbf0",
  },
  gridCellTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#333",
    textAlign: "center" as const,
    marginBottom: 2,
  },
  gridCellTitleSelected: {
    color: "#4A6CF7",
  },
  gridCellCount: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4A6CF7",
  },
  gridCellIngredients: {
    fontSize: 8,
    color: "#888",
    textAlign: "center" as const,
    lineHeight: 11,
    marginTop: 1,
  },
  gridCellEmptyLabel: {
    fontSize: 9,
    color: "#bbb",
    fontWeight: "600",
    marginTop: 2,
  },
  gridDesc: {
    textAlign: "center" as const,
    marginTop: 12,
    fontSize: 13,
    color: "#999",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "600",
  },

  // 바텀시트 스타일
  bottomSheetBackdrop: {
    flex: 1,
    backgroundColor: "#00000044",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "65%",
    minHeight: 280,
    paddingHorizontal: 20,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
  bottomSheetHeader: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ddd",
    marginBottom: 14,
  },
  bottomSheetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  bottomSheetTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111",
  },
  closeSheetBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  sheetLoading: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  sheetEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 10,
  },
  sheetEmptyText: {
    fontSize: 13,
    color: "#999",
    fontWeight: "600",
  },
  ingredientList: {
    flex: 1,
    marginTop: 8,
  },
  ingredientCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 8,
  },
  ingredientInfo: {
    flex: 1,
    gap: 4,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
  },
  ingredientMeta: {
    gap: 2,
  },
  metaText: {
    fontSize: 11,
    color: "#888",
  },
  expiredText: {
    color: "#FF5F5F",
    fontWeight: "700",
  },
  expiringSoonText: {
    color: "#F5A623",
    fontWeight: "700",
  },
  storageTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#e8f0fe",
  },
  storageTagFreezer: {
    backgroundColor: "#e0f2fe",
  },
  storageTagRoom: {
    backgroundColor: "#fef3e0",
  },
  storageTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#555",
  },
  addIngredientBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 12,
  },
  addIngredientBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  pickerSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 28,
    maxHeight: "70%",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  pickerSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    marginBottom: 8,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111",
    paddingVertical: 0,
  },
  pickerList: {
    flex: 1,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
  },
  pickerItemPressed: {
    backgroundColor: "#f6f7fb",
  },
  pickerItemLeft: {
    flex: 1,
  },
  pickerItemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
    marginBottom: 2,
  },
  pickerItemMeta: {
    flexDirection: "row",
    gap: 10,
  },
  pickerMetaText: {
    fontSize: 11,
    color: "#999",
  },
});
