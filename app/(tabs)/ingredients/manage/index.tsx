import { autoFillIngredient, updateIngredient } from "@/api/ingredients";
import queryClient from "@/api/queryClient";
import PageHeader from "@/components/PageHeader";
import QueryErrorView from "@/components/QueryErrorView";
import { colors, queryKey } from "@/constants";
import useGetIngredients from "@/hooks/ingredients/useGetIngredients";
import useUpdateIngredient from "@/hooks/ingredients/useUpdateIngredient";
import { GetIngredientResponse, StorageType } from "@/types";
import { formatInputToYYYYMMDD } from "@/utils/date";
import { getSecureStore } from "@/utils/secureStore";
import { toKoreanStorageType } from "@/utils/storageType";
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

const STORAGE_OPTIONS: {
  type: StorageType;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}[] = [
  { type: "FREEZER", label: "냉동", icon: "snow-outline" },
  { type: "FRIDGE", label: "냉장", icon: "leaf-outline" },
  { type: "ROOM", label: "실온", icon: "sunny-outline" },
];

export default function IngredientsManagePage() {
  const [hasToken, setHasToken] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [manualItem, setManualItem] = useState<GetIngredientResponse | null>(
    null,
  );
  const [manualDate, setManualDate] = useState("");
  const [manualStorage, setManualStorage] = useState<StorageType | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    getSecureStore("accessToken").then((token) => setHasToken(!!token));
  }, []);

  const {
    data: allItems = [],
    isLoading,
    error,
    refetch,
  } = useGetIngredients();

  // 유통기한 또는 보관장소 중 하나라도 없는 재료
  const unclassifiedItems = useMemo(
    () =>
      allItems.filter((item) => !item.expiration_date || !item.storage_type),
    [allItems],
  );

  const updateMutation = useUpdateIngredient({ showAlert: false });

  /* ─── 체크박스 ─── */
  const toggleCheck = (id: number) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /* ─── 자동 입력 (단건) ─── */
  const handleAutoFill = async (item: GetIngredientResponse) => {
    setLoadingIds((prev) => new Set(prev).add(item.id));
    try {
      const autoData = await autoFillIngredient(item.id);
      if (!autoData.is_auto_fillable) {
        Alert.alert("알림", "자동 입력이 불가능한 재료입니다.");
        return;
      }
      await updateIngredient(item.id, {
        expiration_date: autoData.expiration_date,
        storage_type: autoData.storage_type,
      });
      queryClient.invalidateQueries({ queryKey: [queryKey.INGREDIENTS] });
    } catch (e: any) {
      const msg =
        e?.message || e?.response?.data?.detail || "자동 입력에 실패했습니다.";
      Alert.alert("오류", msg);
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  /* ─── 일괄 자동 입력 ─── */
  const handleBatchAutoFill = async () => {
    if (checkedIds.size === 0) return;
    setBatchLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const id of checkedIds) {
      try {
        const autoData = await autoFillIngredient(id);
        if (autoData.is_auto_fillable) {
          await updateIngredient(id, {
            expiration_date: autoData.expiration_date,
            storage_type: autoData.storage_type,
          });
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    setBatchLoading(false);
    setCheckedIds(new Set());
    queryClient.invalidateQueries({ queryKey: [queryKey.INGREDIENTS] });

    const msg =
      failCount > 0
        ? `${successCount}개 완료, ${failCount}개 자동 입력 불가`
        : `${successCount}개 자동 입력 완료`;
    Alert.alert("완료", msg);
  };

  /* ─── 수동 입력 모달 열기 ─── */
  const handleOpenManual = (item: GetIngredientResponse) => {
    setManualItem(item);
    setManualDate(item.expiration_date ?? "");
    setManualStorage(item.storage_type ?? null);
  };

  /* ─── 수동 입력 제출 ─── */
  const handleManualSubmit = () => {
    if (!manualItem) return;
    if (!manualDate && !manualStorage) {
      Alert.alert("알림", "유통기한 또는 보관 방법을 입력해주세요.");
      return;
    }
    const data: Record<string, string> = {};
    if (manualDate) data.expiration_date = manualDate;
    if (manualStorage) data.storage_type = manualStorage;

    updateMutation.mutate(
      { ingredientId: manualItem.id, data },
      { onSuccess: () => setManualItem(null) },
    );
  };

  if (error) {
    return (
      <QueryErrorView error={error} hasToken={hasToken} onRetry={refetch} />
    );
  }

  return (
    <View style={styles.page}>
      <PageHeader title="재료 관리" />

      {/* 일괄 자동 입력 버튼 */}
      <Pressable
        style={[
          styles.batchBtn,
          (checkedIds.size === 0 || batchLoading) && styles.batchBtnDisabled,
        ]}
        onPress={handleBatchAutoFill}
        disabled={checkedIds.size === 0 || batchLoading}
      >
        {batchLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.batchBtnText}>
            일괄 자동 입력 ({checkedIds.size})
          </Text>
        )}
      </Pressable>

      {/* 리스트 */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.BLACK} />
        </View>
      ) : unclassifiedItems.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>입력이 필요한 재료가 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={unclassifiedItems}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const isChecked = checkedIds.has(item.id);
            const isAutoLoading = loadingIds.has(item.id);
            const disabled = isAutoLoading || batchLoading;

            return (
              <View style={styles.card}>
                {/* 체크박스 */}
                <Pressable
                  onPress={() => toggleCheck(item.id)}
                  style={styles.checkboxWrap}
                  disabled={disabled}
                >
                  <Ionicons
                    name={isChecked ? "checkbox" : "square-outline"}
                    size={24}
                    color={isChecked ? colors.BLACK : colors.INACTIVE}
                  />
                </Pressable>

                {/* 재료 정보 + 버튼 */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.ingredient_name}</Text>

                  {/* 구매 날짜 */}
                  {item.purchase_date && (
                    <View style={styles.dateRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={13}
                        color={colors.INACTIVE}
                      />
                      <Text style={styles.dateText}>
                        구매 날짜 {item.purchase_date}
                      </Text>
                    </View>
                  )}

                  {/* 현재 설정된 값 태그 */}
                  <View style={styles.tagRow}>
                    {item.expiration_date ? (
                      <View style={styles.tagGreen}>
                        <Text style={styles.tagGreenText}>
                          유통기한 {item.expiration_date}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.tagRed}>
                        <Text style={styles.tagRedText}>유통기한 미입력</Text>
                      </View>
                    )}
                    {item.storage_type ? (
                      <View style={styles.tagGreen}>
                        <Text style={styles.tagGreenText}>
                          {toKoreanStorageType(item.storage_type)}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.tagRed}>
                        <Text style={styles.tagRedText}>보관장소 미입력</Text>
                      </View>
                    )}
                  </View>

                  {/* 버튼 */}
                  <View style={styles.btnRow}>
                    <Pressable
                      style={[styles.autoBtn, disabled && styles.btnDisabled]}
                      onPress={() => handleAutoFill(item)}
                      disabled={disabled}
                    >
                      {isAutoLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.autoBtnText}>자동 입력</Text>
                      )}
                    </Pressable>

                    <Pressable
                      style={[styles.manualBtn, disabled && styles.btnDisabled]}
                      onPress={() => handleOpenManual(item)}
                      disabled={disabled}
                    >
                      <Text style={styles.manualBtnText}>수동 입력</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* 수동 입력 모달 */}
      <Modal
        visible={manualItem !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setManualItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* 모달 헤더 */}
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setManualItem(null)} hitSlop={8}>
                <Ionicons name="arrow-back" size={22} color={colors.BLACK} />
              </Pressable>
              <Text style={styles.modalTitle}>정보 입력</Text>
              <View style={{ width: 22 }} />
            </View>

            {/* 유통기한 입력 */}
            <Text style={styles.sectionLabel}>유통기한</Text>
            <View style={styles.dateInputRow}>
              <TextInput
                value={manualDate}
                onChangeText={(v) => setManualDate(formatInputToYYYYMMDD(v))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.INACTIVE}
                style={styles.dateInput}
                keyboardType="numeric"
                maxLength={10}
              />
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.INACTIVE}
              />
            </View>

            {/* 보관 방법 */}
            <Text style={styles.sectionLabel}>보관 방법</Text>
            <View style={styles.storageRow}>
              {STORAGE_OPTIONS.map(({ type, label, icon }) => {
                const active = manualStorage === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => setManualStorage(type)}
                    style={[
                      styles.storageBtn,
                      active && styles.storageBtnActive,
                    ]}
                  >
                    <Ionicons
                      name={icon}
                      size={18}
                      color={active ? "#fff" : colors.INACTIVE}
                    />
                    <Text
                      style={[
                        styles.storageBtnText,
                        active && styles.storageBtnTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* 입력 완료 */}
            <Pressable
              style={[
                styles.submitBtn,
                updateMutation.isPending && styles.submitBtnDisabled,
              ]}
              onPress={handleManualSubmit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>입력 완료</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff", padding: 16 },

  /* 일괄 버튼 */
  batchBtn: {
    marginTop: 12,
    backgroundColor: colors.BLACK,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 14,
  },
  batchBtnDisabled: { opacity: 0.35 },
  batchBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },

  /* 공통 */
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: colors.INACTIVE, fontSize: 14 },

  /* 카드 */
  card: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 14,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  checkboxWrap: { paddingTop: 2 },
  name: { fontSize: 16, fontWeight: "700", color: colors.BLACK },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  dateText: { color: colors.INACTIVE, fontSize: 12, fontWeight: "600" },

  /* 태그 */
  tagRow: { flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" },
  tagGreen: {
    backgroundColor: "#E6F4EA",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagGreenText: { color: "#2D6A4F", fontSize: 11, fontWeight: "700" },
  tagRed: {
    backgroundColor: "#FDECEA",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagRedText: { color: "#C62828", fontSize: 11, fontWeight: "700" },

  /* 버튼 행 */
  btnRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  autoBtn: {
    flex: 1,
    backgroundColor: colors.BLACK,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  autoBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  manualBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.BORDER,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  manualBtnText: { color: colors.BLACK, fontWeight: "700", fontSize: 13 },
  btnDisabled: { opacity: 0.4 },

  /* 수동 입력 모달 */
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000055",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 17, fontWeight: "800", color: colors.BLACK },

  sectionLabel: {
    color: colors.INACTIVE,
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 8,
  },

  /* 날짜 입력 */
  dateInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    gap: 8,
  },
  dateInput: {
    flex: 1,
    fontSize: 15,
    color: colors.BLACK,
  },

  /* 보관 방법 버튼 */
  storageRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  storageBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 12,
  },
  storageBtnActive: {
    backgroundColor: colors.BLACK,
    borderColor: colors.BLACK,
  },
  storageBtnText: { color: colors.INACTIVE, fontWeight: "700", fontSize: 13 },
  storageBtnTextActive: { color: "#fff" },

  /* 제출 버튼 */
  submitBtn: {
    backgroundColor: colors.BLACK,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
