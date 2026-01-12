import {
  addIngredient,
  deleteIngredient,
  getIngredients,
  updateIngredient,
} from "@/api/ingredients";
import { GetIngredientResponse, StorageType } from "@/types";
import { getSecureStore } from "@/utils/secureStore";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Filter = "전체" | "미분류" | StorageType;

function fmtYYYYMMDD(d: Date) {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function daysLeft(expiresAt: string | null) {
  if (!expiresAt) return null;
  const end = new Date(expiresAt);
  const now = new Date();
  const diff = end.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function iconByName(name: string) {
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

  const [buyDate, setBuyDate] = useState(fmtYYYYMMDD(new Date()));
  const [name, setName] = useState("");
  const [editName, setEditName] = useState("");
  const [editExpirationDate, setEditExpirationDate] = useState("");
  const [editStorageType, setEditStorageType] = useState<StorageType | "">("");

  const queryClient = useQueryClient();

  useEffect(() => {
    // 토큰 존재 여부 확인
    getSecureStore("accessToken").then((token) => {
      setHasToken(!!token);
    });
  }, []);

  // 필터에 따른 쿼리 파라미터 설정
  const queryParams = useMemo(() => {
    if (filter === "전체") return undefined;
    if (filter === "미분류") return { is_unclassified: true };
    return { is_unclassified: false, storage: filter };
  }, [filter]);

  // 식재료 목록 조회
  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ingredients", queryParams],
    queryFn: () => getIngredients(queryParams),
  });

  // 식재료 추가
  const addMutation = useMutation({
    mutationFn: addIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      setName("");
      setBuyDate(fmtYYYYMMDD(new Date()));
      setAddModalOpen(false);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        JSON.stringify(error?.response?.data) ||
        "식재료 추가에 실패했습니다.";
      console.error("식재료 추가 에러:", error?.response?.data);
      Alert.alert("오류", errorMessage);
    },
  });

  // 식재료 삭제
  const deleteMutation = useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
    onError: (error: any) => {
      Alert.alert("오류", error?.response?.data?.message || "식재료 삭제에 실패했습니다.");
    },
  });

  // 식재료 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateIngredient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      setEditModalOpen(false);
      setSelectedIngredient(null);
    },
    onError: (error: any) => {
      Alert.alert("오류", error?.response?.data?.message || "식재료 수정에 실패했습니다.");
    },
  });

  // 유통기한 순으로 정렬
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (!a.expiration_date && !b.expiration_date) return 0;
      if (!a.expiration_date) return 1;
      if (!b.expiration_date) return -1;
      return (
        new Date(a.expiration_date).getTime() -
        new Date(b.expiration_date).getTime()
      );
    });
  }, [items]);

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert("알림", "식재료명을 입력해주세요.");
      return;
    }
    // 날짜가 없으면 오늘 날짜로 설정
    const purchaseDate = buyDate.trim() || fmtYYYYMMDD(new Date());
    addMutation.mutate({
      purchase_date: purchaseDate,
      ingredients: [name.trim()],
    });
  };

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
    setSelectedIngredient(item);
    setEditName(item.name);
    setEditExpirationDate(item.expiration_date || "");
    setEditStorageType(item.storage_type || "");
    setEditModalOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedIngredient) return;

    const updateData: any = {};
    if (editExpirationDate) updateData.expiration_date = editExpirationDate;
    if (editStorageType) updateData.storage_type = editStorageType;

    updateMutation.mutate({
      id: selectedIngredient.id,
      data: updateData,
    });
  };

  if (error) {
    const isUnauthorized =
      (error as any)?.response?.status === 401 ||
      (error as any)?.status === 401;

    // 토큰이 있는데 401이면 토큰 문제이므로 "로그인하러 가기" 버튼 표시 안 함
    const showLoginButton = isUnauthorized && !hasToken;

    return (
      <View style={styles.errorContainer}>
        <Ionicons name="lock-closed-outline" size={48} color="#c1121f" />
        <Text style={styles.errorText}>
          {isUnauthorized
            ? hasToken
              ? "인증에 실패했습니다. 다시 로그인해주세요."
              : "로그인이 필요합니다"
            : "데이터를 불러오는데 실패했습니다."}
        </Text>
        {showLoginButton && (
          <Pressable
            style={styles.loginBtn}
            onPress={() => router.replace("/auth")}
          >
            <Text style={styles.loginBtnText}>로그인하러 가기</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {/* 상단 제목 */}
      <View style={styles.top}>
        <Text style={styles.title}>재료</Text>
        <Text style={styles.sub}>식재료 공유</Text>
      </View>

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
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            const d = daysLeft(item.expiration_date);
            const dText = d !== null
              ? d >= 0
                ? `D-${d}`
                : `D+${Math.abs(d)}`
              : "미설정";
            const storageText = item.storage_type || "미설정";

            return (
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={styles.iconBox}>
                    <Ionicons
                      name={iconByName(item.name) as any}
                      size={20}
                      color="#111"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>
                      {item.name}, <Text style={styles.dday}>{dText}</Text>{" "}
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
      <Pressable style={styles.fab} onPress={() => setAddModalOpen(true)}>
        <Ionicons name="add" size={28} color="#111" />
      </Pressable>

      {/* 추가 모달 */}
      <Modal
        visible={addModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setAddModalOpen(false)}
        />
        <View style={styles.sheet}>
          <View style={styles.sheetTop}>
            <Pressable
              onPress={() => setAddModalOpen(false)}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={20} color="#111" />
            </Pressable>
            <Text style={styles.sheetTitle}>추가</Text>
            <View style={{ width: 32 }} />
          </View>

          <Text style={styles.inputLabel}>구입날짜</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={buyDate}
              onChangeText={setBuyDate}
              placeholder="YYYY-MM-DD"
              style={[styles.input, { flex: 1 }]}
            />
            <View style={styles.calIcon}>
              <Ionicons name="calendar-outline" size={18} color="#111" />
            </View>
          </View>
          <Text style={styles.helper}>YYYY-MM-DD 형식 / 값이 없으면 오늘</Text>

          <Text style={[styles.inputLabel, { marginTop: 12 }]}>식재료명</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="예) 소고기"
              style={[styles.input, { flex: 1 }]}
            />
            <Pressable style={styles.plusMini} onPress={handleAdd}>
              <Ionicons name="add" size={18} color="#111" />
            </Pressable>
          </View>

          <Pressable
            onPress={handleAdd}
            style={[
              styles.primaryBtn,
              addMutation.isPending && styles.primaryBtnDisabled,
            ]}
            disabled={addMutation.isPending}
          >
            {addMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>추가</Text>
            )}
          </Pressable>
        </View>
      </Modal>

      {/* 수정 모달 */}
      <Modal
        visible={editModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setEditModalOpen(false)}
        />
        <View style={styles.sheet}>
          <View style={styles.sheetTop}>
            <Pressable
              onPress={() => setEditModalOpen(false)}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={20} color="#111" />
            </Pressable>
            <Text style={styles.sheetTitle}>수정</Text>
            <View style={{ width: 32 }} />
          </View>

          <Text style={styles.inputLabel}>식재료명</Text>
          <TextInput
            value={editName}
            editable={false}
            style={[styles.input, { backgroundColor: "#f5f5f5" }]}
          />

          <Text style={[styles.inputLabel, { marginTop: 12 }]}>
            유통기한 (YYYY-MM-DD)
          </Text>
          <TextInput
            value={editExpirationDate}
            onChangeText={setEditExpirationDate}
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />
          <Text style={styles.helper}>
            유통기한을 수정하려면 입력하세요. 빈 값으로 두면 기존 값이 유지됩니다.
          </Text>

          <Text style={[styles.inputLabel, { marginTop: 12 }]}>보관장소</Text>
          <View style={styles.storageRow}>
            {(["냉장", "냉동", "실온"] as StorageType[]).map((s) => (
              <Pressable
                key={s}
                onPress={() =>
                  setEditStorageType(editStorageType === s ? "" : s)
                }
                style={[
                  styles.storageBtn,
                  editStorageType === s && styles.storageBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.storageBtnText,
                    editStorageType === s && styles.storageBtnTextActive,
                  ]}
                >
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.helper}>
            보관장소를 수정하려면 선택하세요. 다시 클릭하면 취소됩니다.
          </Text>

          <Pressable
            onPress={handleUpdate}
            style={[
              styles.primaryBtn,
              updateMutation.isPending && styles.primaryBtnDisabled,
            ]}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>수정</Text>
            )}
          </Pressable>
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

  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 20, fontWeight: "800" },
  sub: { fontSize: 12, color: "#666" },

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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  errorText: { color: "#c1121f", fontSize: 14, textAlign: "center" },
  loginBtn: {
    marginTop: 8,
    backgroundColor: "#111",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  loginBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },

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

  backdrop: { flex: 1, backgroundColor: "#00000066" },
  sheet: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 26,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eee",
    maxHeight: "80%",
  },
  sheetTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitle: { fontSize: 14, fontWeight: "900" },

  inputLabel: {
    marginTop: 10,
    marginBottom: 6,
    color: "#666",
    fontWeight: "700",
  },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  calIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    alignItems: "center",
    justifyContent: "center",
  },
  helper: { marginTop: 6, fontSize: 11, color: "#888" },
  plusMini: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  storageRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  storageBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    backgroundColor: "#fff",
  },
  storageBtnActive: {
    backgroundColor: "#f2f4ff",
    borderColor: "#d9dcff",
  },
  storageBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
  },
  storageBtnTextActive: {
    color: "#111",
  },

  primaryBtn: {
    marginTop: 12,
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryText: { color: "#fff", fontWeight: "900" },
});
