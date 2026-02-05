import PageHeader from "@/components/PageHeader";
import useGetRecipes from "@/hooks/recipes/useGetRecipes";
import type { SaveRecipeResponse } from "@/types";
import { fmtYYYYMMDD } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "@/constants";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: recipes, isLoading, error } = useGetRecipes();

  const detail = useMemo((): SaveRecipeResponse | null => {
    const key = String(id ?? "");
    if (!recipes?.length) return null;
    return (
      recipes.find((r) => String(r.id) === key) ??
      (null as SaveRecipeResponse | null)
    );
  }, [recipes, id]);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(fmtYYYYMMDD(new Date()));

  if (isLoading) {
    return (
      <View style={styles.page}>
        <PageHeader
          title="레시피 상세"
          leftChild={
            <Pressable onPress={() => router.back()} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={22} color="#111" />
            </Pressable>
          }
        />
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={colors.BLACK} />
          <Text style={styles.emptyDesc}>레시피를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (error || !detail) {
    return (
      <View style={styles.page}>
        <PageHeader
          title="레시피 상세"
          leftChild={
            <Pressable onPress={() => router.back()} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={22} color="#111" />
            </Pressable>
          }
        />
        <View style={styles.centerWrap}>
          <Ionicons name="document-text-outline" size={40} color="#999" />
          <Text style={styles.emptyTitle}>레시피를 찾을 수 없어요</Text>
          <Text style={styles.emptyDesc}>
            목록에서 레시피를 선택하면 조리법이 생성됩니다.
          </Text>
          <Pressable onPress={() => router.back()} style={styles.cta}>
            <Text style={styles.ctaText}>목록으로</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <PageHeader
        title="레시피 상세"
        leftChild={
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </Pressable>
        }
        rightChild={
          <Pressable onPress={() => {}} style={styles.iconBtn}>
            <Ionicons name="share-social-outline" size={20} color="#111" />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* 헤더 카드 */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="restaurant-outline" size={28} color="#111" />
          </View>
          <Text style={styles.h1}>{detail.food}</Text>
          {detail.created_at && (
            <Text style={styles.createdAt}>
              저장일: {detail.created_at.slice(0, 10)}
            </Text>
          )}
        </View>

        {/* 재료 섹션 */}
        <Text style={styles.sectionTitle}>사용할 식재료</Text>
        <View style={styles.box}>
          {detail.use_ingredients.map((it) => (
            <View key={it.name} style={styles.ingRow}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#666" />
              <Text style={styles.ingText}>{it.name}</Text>
              {it.amount ? (
                <Text style={styles.ingAmount}>{it.amount}</Text>
              ) : null}
            </View>
          ))}
        </View>

        {/* 방법 섹션 */}
        <Text style={styles.sectionTitle}>요리 방법</Text>
        <View style={styles.box}>
          {detail.steps.map((s, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{idx + 1}</Text>
              </View>
              <Text style={styles.stepText}>{s}</Text>
            </View>
          ))}
        </View>

        {detail.tip ? (
          <>
            <Text style={styles.sectionTitle}>팁</Text>
            <View style={styles.box}>
              <Text style={styles.tipText}>{detail.tip}</Text>
            </View>
          </>
        ) : null}

        {/* CTA */}
        <Pressable onPress={() => setOpen(true)} style={styles.cta}>
          <Text style={styles.ctaText}>요리 기록에 추가하기</Text>
        </Pressable>
      </ScrollView>

      {/* 날짜 모달 */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetTop}>
            <Pressable onPress={() => setOpen(false)} style={styles.iconBtn}>
              <Ionicons name="close" size={20} color="#111" />
            </Pressable>
            <Text style={styles.sheetTitle}>요리 기록</Text>
            <View style={{ width: 36 }} />
          </View>

          <Text style={styles.label}>날짜(YYYY-MM-DD)</Text>
          <View style={styles.row}>
            <TextInput
              value={date}
              onChangeText={setDate}
              style={styles.input}
            />
            <View style={styles.cal}>
              <Ionicons name="calendar-outline" size={18} color="#111" />
            </View>
          </View>

          <Pressable
            style={styles.primary}
            onPress={() => {
              // TODO: 여기서 실제 저장(서버/로컬) 연결하면 됨
              setOpen(false);
              router.replace("/recipes"); // 목록으로
            }}
          >
            <Text style={styles.primaryText}>추가</Text>
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

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ededed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  hero: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#ededed",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ededed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
  },
  h1: { fontSize: 22, fontWeight: "900", color: "#111" },
  createdAt: { fontSize: 12, color: "#666" },

  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 24,
  },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#111" },
  emptyDesc: { fontSize: 13, color: "#666", textAlign: "center" },

  sectionTitle: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "900",
    color: "#111",
  },
  box: {
    borderWidth: 1,
    borderColor: "#ededed",
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },

  ingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ingText: { flex: 1, fontWeight: "800", color: "#111" },
  ingAmount: { fontSize: 13, color: "#666" },

  stepRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ededed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  stepNumText: { fontWeight: "900", color: "#111", fontSize: 12 },
  stepText: { flex: 1, color: "#333", fontWeight: "700", lineHeight: 18 },
  tipText: { color: "#333", fontWeight: "600", lineHeight: 20 },

  cta: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: "#111",
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontWeight: "900" },

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
    borderColor: "#ededed",
  },
  sheetTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: { fontSize: 14, fontWeight: "900", color: "#111" },

  label: {
    marginTop: 10,
    marginBottom: 6,
    color: "#666",
    fontWeight: "800",
    fontSize: 12,
  },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111",
    fontWeight: "700",
  },
  cal: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    marginTop: 12,
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "900" },
});
