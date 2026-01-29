import PageHeader from "@/components/PageHeader";
import QueryErrorView from "@/components/QueryErrorView";
import useCreateShopping from "@/hooks/shopping-list/useCreateShopping";
import useDeleteShopping from "@/hooks/shopping-list/useDeleteShopping";
import useGetShoppingList from "@/hooks/shopping-list/useGetShoppingList";
import { ShoppingListResponse } from "@/types";
import { getSecureStore } from "@/utils/secureStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ShoppingListScreen() {
  const [inputValue, setInputValue] = useState("");
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    getSecureStore("accessToken").then((token) => setHasToken(!!token));
  }, []);

  const { data: items = [], isLoading, error, refetch } = useGetShoppingList();
  const createMutation = useCreateShopping();
  const deleteMutation = useDeleteShopping();

  const toBuyList = useMemo(
    () => items.filter((i) => !completedIds.has(i.id)),
    [items, completedIds]
  );
  const completedList = useMemo(
    () => items.filter((i) => completedIds.has(i.id)),
    [items, completedIds]
  );

  const handleAdd = useCallback(() => {
    const name = inputValue.trim();
    if (!name) return;
    createMutation.mutate({ item_name: name });
    setInputValue("");
  }, [inputValue, createMutation]);

  const toggleCompleted = useCallback((id: number) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDelete = useCallback(
    (item: ShoppingListResponse) => {
      Alert.alert("삭제 확인", `"${item.item_name}"을(를) 삭제하시겠습니까?`, [
        { text: "취소", style: "cancel" },
        { text: "삭제", style: "destructive", onPress: () => deleteMutation.mutate(item.id) },
      ]);
    },
    [deleteMutation]
  );

  const handleBatchDeleteToBuy = useCallback(() => {
    if (toBuyList.length === 0) return;
    Alert.alert(
      "일괄 삭제",
      "구매 예정 목록을 모두 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => toBuyList.forEach((item) => deleteMutation.mutate(item.id)),
        },
      ]
    );
  }, [toBuyList, deleteMutation]);

  const handleBatchDeleteCompleted = useCallback(() => {
    if (completedList.length === 0) return;
    Alert.alert(
      "일괄 삭제",
      "구매 완료 목록을 모두 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => completedList.forEach((item) => deleteMutation.mutate(item.id)),
        },
      ]
    );
  }, [completedList, deleteMutation]);

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
      <PageHeader title="장보기 리스트" />

      {/* 입력 + 추가 버튼 */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="무엇을 사야 하나요?"
          placeholderTextColor="#9AA0A6"
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Pressable
          style={styles.addBtn}
          onPress={handleAdd}
          disabled={createMutation.isPending}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 구매 예정 목록 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>구매 예정 목록</Text>
              {toBuyList.length > 0 && (
                <Pressable onPress={handleBatchDeleteToBuy} hitSlop={8}>
                  <Text style={styles.batchDeleteText}>일괄 삭제</Text>
                </Pressable>
              )}
            </View>
            {toBuyList.map((item) => (
              <ShoppingItemRow
                key={item.id}
                item={item}
                checked={false}
                onToggle={() => toggleCompleted(item.id)}
                onDelete={() => handleDelete(item)}
              />
            ))}
          </View>

          {/* 구매 완료 목록 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>구매 완료 목록</Text>
              {completedList.length > 0 && (
                <Pressable onPress={handleBatchDeleteCompleted} hitSlop={8}>
                  <Text style={styles.batchDeleteText}>일괄 삭제</Text>
                </Pressable>
              )}
            </View>
            {completedList.map((item) => (
              <ShoppingItemRow
                key={item.id}
                item={item}
                checked
                onToggle={() => toggleCompleted(item.id)}
                onDelete={() => handleDelete(item)}
              />
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

function ShoppingItemRow({
  item,
  checked,
  onToggle,
  onDelete,
}: {
  item: ShoppingListResponse;
  checked: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.checkboxWrap} onPress={onToggle}>
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
      </Pressable>
      <Text style={[styles.itemName, checked && styles.itemNameChecked]} numberOfLines={1}>
        {item.item_name}
      </Text>
      <Pressable style={styles.deleteBtn} onPress={onDelete} hitSlop={8}>
        <Ionicons name="trash-outline" size={20} color="#111" />
      </Pressable>
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#EAECEF",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111",
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  batchDeleteText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  checkboxWrap: { padding: 4 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  itemNameChecked: {
    color: "#9AA0A6",
    textDecorationLine: "line-through",
  },
  deleteBtn: {
    padding: 6,
  },
});
