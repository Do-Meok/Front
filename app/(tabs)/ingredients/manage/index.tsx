import PageHeader from "@/components/PageHeader";
import QueryErrorView from "@/components/QueryErrorView";
import { colors } from "@/constants";
import useCreateIngredient from "@/hooks/useCreateIngredient";
import useGetIngredients from "@/hooks/useGetIngredients";
import useUpdateIngredient from "@/hooks/useUpdateIngredient";
import { addDays, fmtYYYYMMDD } from "@/utils/date";
import { getSecureStore } from "@/utils/secureStore";
import { fromKoreanStorageType } from "@/utils/storageType";
import { Ionicons } from "@expo/vector-icons";
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

  // 유통기한이 없는 식재료 (유통기한 입력 모드용)
  const expiryItems = useMemo(() => {
    return allItems.filter((item) => !item.expiration_date);
  }, [allItems]);

  // 스토리지가 없는 식재료 (냉장고 상태 입력 모드용)
  const statusItems = useMemo(() => {
    return allItems.filter((item) => !item.storage_type);
  }, [allItems]);

  // 현재 모드에 따라 필터링
  const unclassifiedItems = useMemo(() => {
    if (mode === "expiry") {
      return expiryItems;
    } else {
      return statusItems;
    }
  }, [mode, expiryItems, statusItems]);

  // 식재료 추가
  const addMutation = useCreateIngredient();

  // 식재료 수정 (유통기한 및 보관장소 설정)
  const updateMutation = useUpdateIngredient();

  const title = mode === "expiry" 
    ? `유통기한 입력(${expiryItems.length})` 
    : `냉장고 상태 입력(${statusItems.length})`;

  const handleSetExpiration = (ingredientId: number, days: number) => {
    const expirationDate = addDays(fmtYYYYMMDD(new Date()), days);
    // 유통기한만 수정, 스토리지는 노터치
    updateMutation.mutate({
      ingredientId,
      data: {
        expiration_date: expirationDate,
      },
    });
  };

  const handleSetStorage = (
    ingredientId: number,
    storageTypeKorean: string
  ) => {
    // 스토리지만 수정, 유통기한은 노터치
    const storageType = fromKoreanStorageType(storageTypeKorean);
    if (storageType) {
      updateMutation.mutate({
        ingredientId,
        data: {
          storage_type: storageType,
        },
      });
    }
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
      {/* 상단 헤더 영역 */}
      <PageHeader title="재료 관리" />

      {/* 세그먼트 탭 */}
      <View style={styles.segment}>
        <Pressable
          onPress={() => setMode("expiry")}
          style={[styles.segBtn, mode === "expiry" && styles.segBtnActive]}
        >
          <Text
            style={[styles.segText, mode === "expiry" && styles.segTextActive]}
          >
            유통기한 입력({expiryItems.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode("status")}
          style={[styles.segBtn, mode === "status" && styles.segBtnActive]}
        >
          <Text
            style={[styles.segText, mode === "status" && styles.segTextActive]}
          >
            냉장고 상태 입력({statusItems.length})
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
                <Text style={styles.name}>{item.ingredient_name}</Text>
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
                          updateMutation.isPending && styles.chipDisabled,
                        ]}
                        disabled={updateMutation.isPending}
                      >
                        <Text style={styles.chipText}>
                          {updateMutation.isPending ? (
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
                    {(["냉장", "냉동", "실온"] as const).map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => handleSetStorage(item.id, s)}
                        style={[
                          styles.chipOutline,
                          updateMutation.isPending && styles.chipDisabled,
                        ]}
                        disabled={updateMutation.isPending}
                      >
                        <Text style={styles.chipOutlineText}>
                          {updateMutation.isPending ? (
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
