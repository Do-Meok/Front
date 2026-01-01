import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
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

type RecipeDetail = {
  id: string;
  title: string;
  rating: number;
  ingredients: { name: string; available: boolean }[];
  steps: string[];
};

const MOCK_DETAIL: Record<string, RecipeDetail> = {
  "kimchi-jjigae": {
    id: "kimchi-jjigae",
    title: "김치찌개",
    rating: 4.6,
    ingredients: [
      { name: "김치", available: true },
      { name: "돼지고기", available: false },
      { name: "두부", available: true },
      { name: "대파", available: false },
    ],
    steps: [
      "냄비에 김치와 고기를 볶습니다.",
      "물을 붓고 끓입니다.",
      "두부를 넣고 5분 더 끓입니다.",
      "대파를 올리고 마무리합니다.",
    ],
  },
  "cream-pasta": {
    id: "cream-pasta",
    title: "크림 파스타",
    rating: 4.2,
    ingredients: [
      { name: "파스타면", available: false },
      { name: "우유", available: true },
      { name: "버터", available: false },
      { name: "마늘", available: true },
    ],
    steps: [
      "면을 삶습니다.",
      "팬에 버터/마늘을 볶습니다.",
      "우유를 넣고 졸입니다.",
      "면을 넣고 섞어 마무리합니다.",
    ],
  },
  "egg-fried-rice": {
    id: "egg-fried-rice",
    title: "계란 볶음밥",
    rating: 4.0,
    ingredients: [
      { name: "밥", available: true },
      { name: "계란", available: true },
      { name: "간장", available: false },
    ],
    steps: [
      "계란을 풀어 볶습니다.",
      "밥을 넣고 볶습니다.",
      "간을 맞추고 마무리합니다.",
    ],
  },
};

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useMemo(() => {
    const key = String(id ?? "");
    return MOCK_DETAIL[key] ?? MOCK_DETAIL["kimchi-jjigae"];
  }, [id]);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(fmtYYYYMMDD(new Date()));

  return (
    <View style={styles.page}>
      {/* 상단 바 */}
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </Pressable>
        <Text style={styles.topTitle}>레시피 상세</Text>
        <Pressable onPress={() => {}} style={styles.iconBtn}>
          <Ionicons name="share-social-outline" size={20} color="#111" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* 헤더 카드 */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="restaurant-outline" size={28} color="#111" />
          </View>
          <Text style={styles.h1}>{detail.title}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#111" />
            <Text style={styles.ratingText}>{detail.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* 재료 섹션 */}
        <Text style={styles.sectionTitle}>사용할 식재료</Text>
        <View style={styles.box}>
          {detail.ingredients.map((it) => (
            <View key={it.name} style={styles.ingRow}>
              <Ionicons
                name={it.available ? "checkmark-circle" : "close-circle"}
                size={18}
                color={it.available ? "#1a7f37" : "#b42318"}
              />
              <Text style={styles.ingText}>{it.name}</Text>
              <View
                style={[
                  styles.badge,
                  it.available ? styles.badgeOk : styles.badgeNo,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    it.available ? styles.badgeTextOk : styles.badgeTextNo,
                  ]}
                >
                  {it.available ? "있음" : "없음"}
                </Text>
              </View>
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

  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topTitle: { fontSize: 14, fontWeight: "900", color: "#111" },
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
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingText: { fontWeight: "800", color: "#111" },

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
  badge: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999 },
  badgeOk: { backgroundColor: "#eaf6ed" },
  badgeNo: { backgroundColor: "#fdecec" },
  badgeText: { fontSize: 12, fontWeight: "900" },
  badgeTextOk: { color: "#1a7f37" },
  badgeTextNo: { color: "#b42318" },

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
