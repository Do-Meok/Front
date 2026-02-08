import PageHeader from "@/components/PageHeader";
import { useFridgeContext } from "@/providers/FridgeProvider";
import { Ionicons } from "@expo/vector-icons";
import { type Href, router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

const CELL_KEY = (row: number, col: number) => `${row}-${col}`;
const CELL_GAP = 10;
const PAGE_PADDING = 32; // 16 * 2
const MIN_CELL_SIZE = 95;

export default function FridgeScreen() {
  const { fridges } = useFridgeContext();
  const [selectedFridgeId, setSelectedFridgeId] = useState<string | null>(
    fridges[0]?.id ?? null
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const selectedFridge = useMemo(
    () => fridges.find((f) => f.id === selectedFridgeId) ?? fridges[0],
    [fridges, selectedFridgeId]
  );

  const selectedCellIngredients = useMemo(() => {
    if (!selectedFridge || !selectedCell) return [];
    const key = CELL_KEY(selectedCell.row, selectedCell.col);
    return selectedFridge.cellIngredients?.[key] ?? [];
  }, [selectedFridge, selectedCell]);

  const { width: screenWidth } = useWindowDimensions();
  const gridContentWidth = screenWidth - PAGE_PADDING;
  const cellSize = useMemo(() => {
    if (!selectedFridge) return MIN_CELL_SIZE;
    const cols = selectedFridge.cols;
    const totalGap = CELL_GAP * (cols - 1);
    const size = (gridContentWidth - totalGap) / cols;
    return Math.max(MIN_CELL_SIZE, Math.floor(size));
  }, [selectedFridge, gridContentWidth]);

  return (
    <View style={styles.page}>
      <PageHeader title="냉장고 관리" />

      {/* 냉장고 선택 드롭다운 */}
      <Pressable
        style={styles.dropdown}
        onPress={() => setDropdownOpen(true)}
      >
        <Text style={styles.dropdownText} numberOfLines={1}>
          {selectedFridge?.name ?? "냉장고 선택"}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </Pressable>

      {/* 냉장고 추가 / 위치 찾기 / 식재료 넣기 */}
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
        <Pressable
          style={styles.actionBtn}
          onPress={() => router.push("/ingredients/fridge/add" as Href)}
        >
          <Ionicons name="add-circle" size={18} color="#111" />
          <Text style={styles.actionBtnText}>식재료 넣기</Text>
        </Pressable>
      </View>

      {/* 냉장고 격자 (가로 cols × 세로 rows) - 칸 크게 표시 */}
      {selectedFridge && (
        <View style={styles.gridWrap}>
          <View
            style={[
              styles.grid,
              {
                gap: CELL_GAP,
                width: gridContentWidth,
              },
            ]}
          >
            {Array.from({ length: selectedFridge.rows }).map((_, row) =>
              Array.from({ length: selectedFridge.cols }).map((_, col) => {
                const key = CELL_KEY(row, col);
                const isSelected =
                  selectedCell?.row === row && selectedCell?.col === col;
                const ingredients =
                  selectedFridge.cellIngredients?.[key] ?? [];
                return (
                  <Pressable
                    key={key}
                    style={[
                      styles.cell,
                      isSelected && styles.cellSelected,
                      {
                        width: cellSize,
                        height: cellSize,
                      },
                    ]}
                    onPress={() =>
                      setSelectedCell(isSelected ? null : { row, col })
                    }
                  >
                    {ingredients.length > 0 && (
                      <View style={styles.cellBadge}>
                        <Text style={styles.cellBadgeText}>
                          {ingredients.length}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      )}

      {/* 칸 선택 시 식재료 표시 */}
      {selectedCell !== null && (
        <View style={styles.cellInfo}>
          <Text style={styles.cellInfoTitle}>
            칸 ({selectedCell.row + 1}, {selectedCell.col + 1})
          </Text>
          {selectedCellIngredients.length === 0 ? (
            <Text style={styles.cellInfoEmpty}>
              이 칸에 등록된 식재료가 없습니다.
            </Text>
          ) : (
            <View style={styles.ingredientList}>
              {selectedCellIngredients.map((name, i) => (
                <Text key={i} style={styles.ingredientItem}>
                  • {name}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 드롭다운 모달 */}
      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setDropdownOpen(false)}
        />
        <View style={styles.dropdownSheet}>
          <Text style={styles.sheetTitle}>냉장고 리스트</Text>
          {fridges.length === 0 ? (
            <Text style={styles.sheetEmpty}>등록된 냉장고가 없습니다.</Text>
          ) : (
            fridges.map((f) => (
              <Pressable
                key={f.id}
                style={styles.sheetItem}
                onPress={() => {
                  setSelectedFridgeId(f.id);
                  setDropdownOpen(false);
                }}
              >
                <Text style={styles.sheetItemText}>{f.name}</Text>
                {selectedFridgeId === f.id && (
                  <Ionicons name="checkmark" size={20} color="#111" />
                )}
              </Pressable>
            ))
          )}
        </View>
      </Modal>
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
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    flex: 1,
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
  gridWrap: {
    alignItems: "flex-start",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#eaeaea",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 10,
  },
  cellSelected: {
    borderColor: "#111",
    backgroundColor: "#f2f4ff",
  },
  cellBadge: {
    backgroundColor: "#111",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cellBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  cellInfo: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eaeaea",
  },
  cellInfoTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111",
    marginBottom: 8,
  },
  cellInfoEmpty: {
    fontSize: 13,
    color: "#666",
  },
  ingredientList: {
    gap: 4,
  },
  ingredientItem: {
    fontSize: 13,
    color: "#333",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "#00000055",
  },
  dropdownSheet: {
    position: "absolute",
    left: 16,
    right: 16,
    top: "30%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eaeaea",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111",
  },
  sheetEmpty: {
    fontSize: 14,
    color: "#666",
    paddingVertical: 8,
  },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sheetItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
});
