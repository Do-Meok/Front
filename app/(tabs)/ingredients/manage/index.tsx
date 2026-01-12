import { setIngredientDetails } from "@/api/ingredients";
import { colors } from "@/constants";
import useCreateIngredient from "@/hooks/useCreateIngredient";
import useGetIngredients from "@/hooks/useGetIngredients";
import { StorageType } from "@/types";
import { getSecureStore } from "@/utils/secureStore";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

function fmtYYYYMMDD(d: Date) {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function addDays(dateStr: string, days: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return fmtYYYYMMDD(dt);
}

export default function IngredientsManagePage() {
  const [mode, setMode] = useState<"expiry" | "status">("expiry");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState(fmtYYYYMMDD(new Date()));
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // 토큰 존재 여부 확인
    getSecureStore("accessToken").then((token) => {
      setHasToken(!!token);
    });
  }, []);

  // 식재료 목록 조회
  const {
    data: allItems = [],
    isLoading,
    error,
    refetch,
  } = useGetIngredients();

  // 보관 데이터가 없는 식재료 필터링
  const unclassifiedItems = useMemo(() => {
    return allItems.filter((item) => !item.storage_type);
  }, [allItems]);

  const queryClient = useQueryClient();

  // 식재료 추가
  const addMutation = useCreateIngredient();

  // 유통기한 및 보관장소 설정
  const setDetailsMutation = useMutation({
    mutationFn: ({
      ingredientId,
      expirationDate,
      storageType,
    }: {
      ingredientId: number;
      expirationDate: string;
      storageType: StorageType;
    }) =>
      setIngredientDetails(ingredientId, {
        expiration_date: expirationDate,
        storage_type: storageType,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
    onError: (error: any) => {
      Alert.alert(
        "오류",
        error?.response?.data?.message || "설정에 실패했습니다."
      );
    },
  });

  const title =
    mode === "expiry" ? "유통기한 입력" : "냉장고 상태 입력";

  const handleSetExpiration = (ingredientId: number, days: number) => {
    const expirationDate = addDays(fmtYYYYMMDD(new Date()), days);
    // 기본 보관장소는 냉장으로 설정
    setDetailsMutation.mutate({
      ingredientId,
      expirationDate,
      storageType: "냉장",
    });
  };

  const handleSetStorage = (
    ingredientId: number,
    storageType: StorageType
  ) => {
    // 유통기한은 구입일 기준 7일로 설정 (또는 사용자 입력 필요)
    const expirationDate = addDays(fmtYYYYMMDD(new Date()), 7);
    setDetailsMutation.mutate({
      ingredientId,
      expirationDate,
      storageType,
    });
  };

  const handleAdd = () => {
    if (!newName.trim()) {
      Alert.alert("알림", "재료명을 입력해주세요.");
      return;
    }
    // 날짜가 없으면 오늘 날짜로 설정
    const purchaseDate = newDate.trim() || fmtYYYYMMDD(new Date());
    addMutation.mutate(
      {
        purchase_date: purchaseDate,
        ingredients: [newName.trim()],
      },
      {
        onSuccess: () => {
          setNewName("");
          setNewDate(fmtYYYYMMDD(new Date()));
          setAddModalOpen(false);
        },
      }
    );
  };

  if (error) {
    const isUnauthorized =
      (error as any)?.response?.status === 401 ||
      (error as any)?.status === 401;

    // 토큰이 있는데 401이면 토큰 문제이므로 "로그인하러 가기" 버튼 표시 안 함
    const showLoginButton = isUnauthorized && !hasToken;
    const showRetryButton = !isUnauthorized;

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
        {showRetryButton && (
          <Pressable
            style={styles.retryBtn}
            onPress={() => refetch()}
          >
            <Text style={styles.retryBtnText}>다시시도하기</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {/* 상단 헤더 영역 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>재료 관리</Text>
        <Pressable
          onPress={() => setAddModalOpen(true)}
          style={styles.headerPlus}
        >
          <Ionicons name="add" size={22} color={colors.BLACK} />
        </Pressable>
      </View>

      {/* 세그먼트 탭 */}
      <View style={styles.segment}>
        <Pressable
          onPress={() => setMode("expiry")}
          style={[styles.segBtn, mode === "expiry" && styles.segBtnActive]}
        >
          <Text
            style={[styles.segText, mode === "expiry" && styles.segTextActive]}
          >
            유통기한 입력
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode("status")}
          style={[styles.segBtn, mode === "status" && styles.segBtnActive]}
        >
          <Text
            style={[styles.segText, mode === "status" && styles.segTextActive]}
          >
            냉장고 상태 입력
          </Text>
        </Pressable>
      </View>

      {/* 모드 타이틀 */}
      <Text style={styles.modeTitle}>{title}</Text>

      {/* 리스트 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.BLACK} />
        </View>
      ) : unclassifiedItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            보관 데이터가 없는 식재료가 없습니다.
          </Text>
        </View>
      ) : (
        <FlatList
          data={unclassifiedItems}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                {item.purchase_date && (
                  <View style={styles.row2}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={colors.INACTIVE}
                    />
                    <Text style={styles.date}>
                      구입일: {item.purchase_date}
                    </Text>
                  </View>
                )}

                {/* 유통기한 입력 모드 */}
                {mode === "expiry" ? (
                  <View style={styles.chips}>
                    {[3, 5, 7].map((d) => (
                      <Pressable
                        key={d}
                        onPress={() => handleSetExpiration(item.id, d)}
                        style={[
                          styles.chip,
                          setDetailsMutation.isPending && styles.chipDisabled,
                        ]}
                        disabled={setDetailsMutation.isPending}
                      >
                        <Text style={styles.chipText}>
                          {setDetailsMutation.isPending ? (
                            <ActivityIndicator size="small" color={colors.BLACK} />
                          ) : (
                            `+${d}일`
                          )}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  /* 냉장고 상태 입력 모드 */
                  <View style={styles.chips}>
                    {(["냉장", "냉동", "실온"] as StorageType[]).map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => handleSetStorage(item.id, s)}
                        style={[
                          styles.chipOutline,
                          setDetailsMutation.isPending && styles.chipDisabled,
                        ]}
                        disabled={setDetailsMutation.isPending}
                      >
                        <Text style={styles.chipOutlineText}>
                          {setDetailsMutation.isPending ? (
                            <ActivityIndicator size="small" color={colors.INACTIVE} />
                          ) : (
                            s
                          )}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}

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
          <Text style={styles.sheetTitle}>재료 추가</Text>

          <Text style={styles.inputLabel}>재료명</Text>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="예) 소고기"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>구입일 (YYYY-MM-DD)</Text>
          <TextInput
            value={newDate}
            onChangeText={setNewDate}
            placeholder="YYYY-MM-DD (비워두면 오늘)"
            style={styles.input}
          />
          <Text style={styles.helper}>값이 없으면 오늘 날짜로 설정됩니다</Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  headerPlus: {
    padding: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 10,
  },

  segment: {
    marginTop: 12,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 12,
    overflow: "hidden",
  },
  segBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  segBtnActive: { backgroundColor: "#f4f6ff" },
  segText: { color: colors.INACTIVE, fontWeight: "600" },
  segTextActive: { color: colors.BLACK },

  modeTitle: { marginTop: 12, marginBottom: 8, color: colors.INACTIVE },

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
    backgroundColor: colors.BLACK,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  loginBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },
  retryBtn: {
    marginTop: 8,
    backgroundColor: colors.BLACK,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  retryBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { color: colors.INACTIVE, fontSize: 14 },

  card: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 14,
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: "700" },
  row2: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  date: { color: colors.INACTIVE, fontWeight: "600" },

  chips: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#f1f3ff",
    borderRadius: 999,
  },
  chipText: { color: colors.BLACK, fontWeight: "700", fontSize: 12 },
  chipDisabled: { opacity: 0.5 },

  chipOutline: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 999,
  },
  chipOutlineText: { color: colors.INACTIVE, fontWeight: "700", fontSize: 12 },

  backdrop: { flex: 1, backgroundColor: "#00000055" },
  sheet: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  sheetTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  inputLabel: {
    marginTop: 8,
    marginBottom: 6,
    color: colors.INACTIVE,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  helper: { marginTop: 6, fontSize: 11, color: "#888" },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: colors.BLACK,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryText: { color: "#fff", fontWeight: "800" },
});
