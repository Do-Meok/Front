import AddIngredientModal from "@/components/AddIngredientModal";
import EditIngredientModal from "@/components/EditIngredientModal";
import PageHeader from "@/components/PageHeader";
import QueryErrorView from "@/components/QueryErrorView";
import useDeleteIngredient from "@/hooks/ingredients/useDeleteIngredient";
import useGetIngredients from "@/hooks/ingredients/useGetIngredients";
import { GetIngredientResponse, StorageType } from "@/types";
import { daysLeft } from "@/utils/date";
import { getSecureStore } from "@/utils/secureStore";
import { fromKoreanStorageType, toKoreanStorageType } from "@/utils/storageType";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Filter = "전체" | "미분류" | StorageType | "냉장" | "냉동" | "실온";

function iconByName(name: string) {
  if (!name) return "nutrition-outline";
  if (name.includes("소고기") || name.includes("고기"))
    return "restaurant-outline";
  if (name.includes("우유")) return "cafe-outline";
  if (name.includes("양파")) return "leaf-outline";
  if (name.includes("계란")) return "egg-outline" as any;
  return "nutrition-outline";
}

export default function IngredientsScreen() {
  const [filter, setFilter] = useState<Filter>("전체");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    useState<GetIngredientResponse | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // 토큰 존재 여부 확인
    getSecureStore("accessToken").then((token) => {
      setHasToken(!!token);
    });
  }, []);

  // 식재료 목록 조회
  const {
    data: items = [],
    isLoading,
    error,
    refetch,
  } = useGetIngredients();

  // 식재료 삭제
  const deleteMutation = useDeleteIngredient();

  // 필터링 및 유통기한 순으로 정렬
  const sortedItems = useMemo(() => {
    // 필터에 따라 데이터 필터링
    let filtered = [...items];
    
    if (filter === "미분류") {
      // storage_type이 null인 경우
      filtered = filtered.filter((item) => !item.storage_type);
    } else if (filter !== "전체") {
      // 한국어 필터를 StorageType으로 변환
      const storageType = fromKoreanStorageType(filter);
      if (storageType) {
        filtered = filtered.filter((item) => item.storage_type === storageType);
      }
    }
    
    // 유통기한 순으로 정렬
    return filtered.sort((a, b) => {
      if (!a.expiration_date && !b.expiration_date) return 0;
      if (!a.expiration_date) return 1;
      if (!b.expiration_date) return -1;
      return (
        new Date(a.expiration_date).getTime() -
        new Date(b.expiration_date).getTime()
      );
    });
  }, [items, filter]);

  const handleDelete = (id: number) => {
    Alert.alert("삭제 확인", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  };

  const handleEdit = (item: GetIngredientResponse) => {
    setAddModalOpen(false);
    setSelectedIngredient(item);
    setEditModalOpen(true);
  };

  if (error) {
    return (
      <QueryErrorView
        error={error}
        hasToken={hasToken}
        onRetry={refetch}
      />
    );
  }

  return (
    <View style={styles.page}>
      {/* 상단 제목 */}
      <PageHeader title="재료" />

      {/* 필터 탭 */}
      <View style={styles.filterRow}>
        {(["전체", "미분류", "냉장", "냉동", "실온"] as const).map((t) => {
          const active = filter === t;
          return (
            <Pressable
              key={t}
              onPress={() => setFilter(t)}
              style={[styles.filterPill, active && styles.filterPillActive]}
            >
              <Text
                style={[styles.filterText, active && styles.filterTextActive]}
              >
                {t}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 리스트 헤더 */}
      <Text style={styles.listTitle}>전체 식재료 리스트(유통기한 임박순)</Text>

      {/* 리스트 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111" />
        </View>
      ) : (
        <FlatList
          data={sortedItems}
          keyExtractor={(x) => String(x.id)}
          contentContainerStyle={{ paddingBottom: 10 }}
          renderItem={({ item }) => {
            const d = daysLeft(item.expiration_date);
            const dText = d !== null
              ? d >= 0
                ? `D-${d}`
                : `D+${Math.abs(d)}`
              : "미설정";
            const storageText = toKoreanStorageType(item.storage_type);

            return (
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={styles.iconBox}>
                    <Ionicons
                      name={iconByName(item.ingredient_name) as any}
                      size={20}
                      color="#111"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>
                      {item.ingredient_name}, <Text style={styles.dday}>{dText}</Text>{" "}
                      <Text style={styles.storage}>({storageText})</Text>
                    </Text>
                    {item.expiration_date && (
                      <Text style={styles.cardSub}>
                        유통기한: {item.expiration_date}
                      </Text>
                    )}
                    {item.purchase_date && (
                      <Text style={styles.cardSub}>
                        구입일: {item.purchase_date}
                      </Text>
                    )}
                  </View>
                </View>

                {/* 오른쪽 액션 */}
                <View style={styles.actions}>
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => handleEdit(item)}
                  >
                    <Ionicons name="create-outline" size={18} color="#111" />
                  </Pressable>
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#111" />
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* + 버튼 */}
      <Pressable
        style={styles.fab}
        onPress={() => {
          setEditModalOpen(false);
          setSelectedIngredient(null);
          setAddModalOpen(true);
        }}
      >
        <Ionicons name="add" size={28} color="#111" />
      </Pressable>

      {/* 추가 모달 */}
      <AddIngredientModal
        visible={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      {/* 수정 모달 */}
      <EditIngredientModal
        visible={editModalOpen}
        ingredient={selectedIngredient}
        onClose={() => {
          setAddModalOpen(false);
          setEditModalOpen(false);
          setSelectedIngredient(null);
        }}
      />
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


  filterRow: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#fff",
  },
  filterPillActive: { backgroundColor: "#f2f4ff", borderColor: "#d9dcff" },
  filterText: { fontSize: 12, fontWeight: "700", color: "#666" },
  filterTextActive: { color: "#111" },

  listTitle: { marginTop: 12, marginBottom: 10, color: "#777", fontSize: 12 },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#eaeaea",
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: "#fff",
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
      },
    }),
  },
  cardLeft: { flexDirection: "row", gap: 10, alignItems: "center", flex: 1 },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  cardTitle: { fontSize: 14, fontWeight: "800", color: "#111" },
  dday: { color: "#c1121f" },
  storage: { color: "#666", fontWeight: "700" },
  cardSub: { marginTop: 4, color: "#777", fontSize: 12 },

  actions: { flexDirection: "row", gap: 8, marginLeft: 10 },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  fab: {
    position: "absolute",
    right: 18,
    bottom: 90,
    width: 54,
    height: 54,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#eaeaea",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    ...Platform.select({
      android: { elevation: 6 },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
    }),
  },

});
