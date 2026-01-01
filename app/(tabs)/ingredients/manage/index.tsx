import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type Row = {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  checked?: boolean;
};

function addDays(dateStr: string, days: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export default function IngredientsManagePage() {
  const [mode, setMode] = useState<"expiry" | "status">("expiry");
  const [open, setOpen] = useState(false);

  const [rows, setRows] = useState<Row[]>([
    { id: "1", name: "소고기", date: "2025-01-01" },
    { id: "2", name: "우유", date: "2025-01-03" },
    { id: "3", name: "양파", date: "2025-01-08" },
  ]);

  const title = useMemo(
    () => (mode === "expiry" ? "유통기한 입력" : "냉장고 상태 입력"),
    [mode],
  );

  const toggleCheck = (id: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, checked: !r.checked } : r)),
    );
  };

  const bump = (id: string, days: number) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, date: addDays(r.date, days) } : r,
      ),
    );
  };

  // 모달 입력 상태(간단)
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("2025-01-01");

  const addRow = () => {
    if (!newName.trim()) return;
    setRows((prev) => [
      { id: String(Date.now()), name: newName.trim(), date: newDate },
      ...prev,
    ]);
    setNewName("");
    setNewDate("2025-01-01");
    setOpen(false);
  };

  return (
    <View style={styles.page}>
      {/* 상단 헤더 영역 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>재료 관리</Text>
        <Pressable onPress={() => setOpen(true)} style={styles.headerPlus}>
          <Ionicons name="add" size={22} color={colors.ACTIVE} />
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

      {/* 모드 타이틀(선택) */}
      <Text style={styles.modeTitle}>{title}</Text>

      {/* 리스트 */}
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable
              onPress={() => toggleCheck(item.id)}
              style={styles.check}
            >
              <Ionicons
                name={item.checked ? "checkbox" : "square-outline"}
                size={22}
                color={item.checked ? colors.ACTIVE : colors.INACTIVE}
              />
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.row2}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.INACTIVE}
                />
                <Text style={styles.date}>{item.date}</Text>
              </View>

              {/* 와이어프레임의 +5일 칩 */}
              {mode === "expiry" ? (
                <View style={styles.chips}>
                  {[5, 5, 5].map((d, idx) => (
                    <Pressable
                      key={`${item.id}-${idx}`}
                      onPress={() => bump(item.id, d)}
                      style={styles.chip}
                    >
                      <Text style={styles.chipText}>+{d}일</Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={styles.chips}>
                  {["양호", "주의", "폐기"].map((s) => (
                    <Pressable key={s} style={styles.chipOutline}>
                      <Text style={styles.chipOutlineText}>{s}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      />

      {/* 추가 모달 */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>재료 추가</Text>

          <Text style={styles.inputLabel}>재료명</Text>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="예) 소고기"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>유통기한 (YYYY-MM-DD)</Text>
          <TextInput
            value={newDate}
            onChangeText={setNewDate}
            placeholder="2025-01-01"
            style={styles.input}
          />

          <Pressable onPress={addRow} style={styles.primaryBtn}>
            <Text style={styles.primaryText}>추가</Text>
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
  segTextActive: { color: colors.ACTIVE },

  modeTitle: { marginTop: 12, marginBottom: 8, color: colors.INACTIVE },

  card: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 14,
    marginBottom: 10,
  },
  check: { paddingTop: 2 },
  name: { fontSize: 16, fontWeight: "700" },
  row2: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  date: { color: colors.INACTIVE, fontWeight: "600" },

  chips: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#f1f3ff",
    borderRadius: 999,
  },
  chipText: { color: colors.ACTIVE, fontWeight: "700", fontSize: 12 },

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
  primaryBtn: {
    marginTop: 12,
    backgroundColor: colors.ACTIVE,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "800" },
});
