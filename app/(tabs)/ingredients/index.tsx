import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Storage = "냉장" | "냉동" | "실온";
type Filter = "전체" | Storage;

type Ingredient = {
  id: string;
  name: string;
  storage: Storage;
  expiresAt: string; // YYYY-MM-DD
};

function fmtYYYYMMDD(d: Date) {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function daysLeft(expiresAt: string) {
  const end = new Date(expiresAt);
  const now = new Date();
  const diff = end.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function iconByName(name: string) {
  // 간단 매핑(와이어프레임 느낌용)
  if (name.includes("소고기") || name.includes("고기"))
    return "restaurant-outline";
  if (name.includes("우유")) return "cafe-outline";
  if (name.includes("양파")) return "leaf-outline";
  if (name.includes("계란")) return "egg-outline" as any; // Ionicons에 egg가 환경에 따라 없을 수 있어 안전처리
  return "nutrition-outline";
}

export default function IngredientsScreen() {
  const [filter, setFilter] = useState<Filter>("전체");

  const [items, setItems] = useState<Ingredient[]>([
    { id: "1", name: "소고기", storage: "냉장", expiresAt: "2026-01-03" },
    { id: "2", name: "우유", storage: "냉장", expiresAt: "2026-01-02" },
    { id: "3", name: "양파", storage: "실온", expiresAt: "2026-01-05" },
    { id: "4", name: "계란", storage: "냉장", expiresAt: "2026-01-10" },
  ]);

  const filtered = useMemo(() => {
    if (filter === "전체") return items;
    return items.filter((x) => x.storage === filter);
  }, [filter, items]);

  // 모달(추가)
  const [open, setOpen] = useState(false);
  const [buyDate, setBuyDate] = useState(fmtYYYYMMDD(new Date()));
  const [name, setName] = useState("");

  const addItem = () => {
    if (!name.trim()) return;
    // 여기선 간단히 "구입날짜+7일"을 expiresAt으로 잡음(나중에 로직 바꾸면 됨)
    const exp = new Date(buyDate);
    exp.setDate(exp.getDate() + 7);

    const newItem: Ingredient = {
      id: String(Date.now()),
      name: name.trim(),
      storage: filter === "전체" ? "냉장" : filter, // 필터가 저장소면 그걸로 자동 지정
      expiresAt: fmtYYYYMMDD(exp),
    };

    setItems((prev) => [newItem, ...prev]);
    setName("");
    setBuyDate(fmtYYYYMMDD(new Date()));
    setOpen(false);
  };

  const onDelete = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <View style={styles.page}>
      {/* 상단 제목 */}
      <View style={styles.top}>
        <Text style={styles.title}>재료</Text>
        <Text style={styles.sub}>식재료 공유</Text>
      </View>

      {/* 필터 탭 */}
      <View style={styles.filterRow}>
        {(["전체", "냉장", "냉동", "실온"] as const).map((t) => {
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
      <FlatList
        data={filtered}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const d = daysLeft(item.expiresAt);
          const dText = d >= 0 ? `D-${d}` : `D+${Math.abs(d)}`;
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
                    <Text style={styles.storage}>({item.storage})</Text>
                  </Text>
                  <Text style={styles.cardSub}>유통기한: {item.expiresAt}</Text>
                </View>
              </View>

              {/* 오른쪽 액션 */}
              <View style={styles.actions}>
                <Pressable style={styles.actionBtn} onPress={() => {}}>
                  <Ionicons name="create-outline" size={18} color="#111" />
                </Pressable>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => onDelete(item.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#111" />
                </Pressable>
              </View>
            </View>
          );
        }}
      />

      {/* + 버튼 */}
      <Pressable style={styles.fab} onPress={() => setOpen(true)}>
        <Ionicons name="add" size={28} color="#111" />
      </Pressable>

      {/* 추가 모달 */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetTop}>
            <Pressable onPress={() => setOpen(false)} style={styles.closeBtn}>
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
            <Pressable style={styles.plusMini} onPress={addItem}>
              <Ionicons name="add" size={18} color="#111" />
            </Pressable>
          </View>

          <Pressable onPress={addItem} style={styles.primaryBtn}>
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

  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 20, fontWeight: "800" },
  sub: { fontSize: 12, color: "#666" },

  filterRow: { flexDirection: "row", gap: 8, marginTop: 10 },
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
    bottom: 90, // 탭바 위로 올림
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

  primaryBtn: {
    marginTop: 12,
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "900" },
});
