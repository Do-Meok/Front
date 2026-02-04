import PageHeader from "@/components/PageHeader";
import QueryErrorView from "@/components/QueryErrorView";
import useGetIngredients from "@/hooks/ingredients/useGetIngredients";
import { StorageType } from "@/types";
import { daysLeft } from "@/utils/date";
import { getSecureStore } from "@/utils/secureStore";
import { fromKoreanStorageType, toKoreanStorageType } from "@/utils/storageType";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View
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

export default function FridgeSearchScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("전체");
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    getSecureStore("accessToken").then((token) => {
      setHasToken(!!token);
    });
  }, []);

  const {
    data: items = [],
    isLoading,
    error,
    refetch,
  } = useGetIngredients();

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filter === "미분류") {
      result = result.filter((item) => !item.storage_type);
    } else if (filter !== "전체") {
      const storageType = fromKoreanStorageType(filter);
      if (storageType) {
        result = result.filter((item) => item.storage_type === storageType);
      }
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((item) =>
        item.ingredient_name.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => {
      if (!a.expiration_date && !b.expiration_date) return 0;
      if (!a.expiration_date) return 1;
      if (!b.expiration_date) return -1;
      return (
        new Date(a.expiration_date).getTime() -
        new Date(b.expiration_date).getTime()
      );
    });
  }, [items, filter, query]);

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
      <PageHeader title="냉장고 재료 검색" />

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="식재료명으로 검색"
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.filterRow}>
        {(["전체", "미분류", "냉장", "냉동", "실온"] as const).map((t) => {
          const active = filter === t;
          return (
            <Text
              key={t}
              style={[styles.filterPill, active && styles.filterPillActive]}
            >
              {t}
            </Text>
          );
        })}
      </View>

      <Text style={styles.listTitle}>
        검색 결과 {filteredItems.length}건
      </Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111" />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(x) => String(x.id)}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {query.trim() ? "검색 결과가 없습니다." : "식재료를 검색해보세요."}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const d = daysLeft(item.expiration_date);
            const dText =
              d !== null
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
                      {item.ingredient_name},{" "}
                      <Text style={styles.dday}>{dText}</Text>{" "}
                      <Text style={styles.storage}>({storageText})</Text>
                    </Text>
                    {item.expiration_date && (
                      <Text style={styles.cardSub}>
                        유통기한: {item.expiration_date}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
        />
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
    backgroundColor: "#fafafa",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 4,
    color: "#111",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    flexWrap: "wrap",
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#fff",
  },
  filterPillActive: {
    backgroundColor: "#f2f4ff",
    borderColor: "#d9dcff",
  },
  filterText: { fontSize: 12, fontWeight: "700", color: "#666" },
  filterTextActive: { color: "#111" },
  listTitle: { marginTop: 12, marginBottom: 10, color: "#777", fontSize: 12 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
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
});
