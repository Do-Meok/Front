import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type Fridge = {
  id: string;
  name: string; // 예: "메인 냉장고"
  sections: string[]; // 예: ["냉장", "냉동"]
};

export default function FridgeManagePage() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Fridge[]>([
    { id: "1", name: "메인 냉장고", sections: ["냉장", "냉동"] },
  ]);

  const [name, setName] = useState("");
  const [sec1, setSec1] = useState("냉장");
  const [sec2, setSec2] = useState("냉동");

  const addFridge = () => {
    if (!name.trim()) return;
    setItems((prev) => [
      {
        id: String(Date.now()),
        name: name.trim(),
        sections: [sec1, sec2].filter(Boolean),
      },
      ...prev,
    ]);
    setName("");
    setSec1("냉장");
    setSec2("냉동");
    setOpen(false);
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>냉장고 관리</Text>
        <Pressable onPress={() => setOpen(true)} style={styles.headerPlus}>
          <Ionicons name="add" size={22} color={colors.ACTIVE} />
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Ionicons name="snow-outline" size={20} color={colors.INACTIVE} />
              <Text style={styles.name}>{item.name}</Text>
            </View>

            <View style={styles.sections}>
              {item.sections.map((s) => (
                <View key={s} style={styles.pill}>
                  <Text style={styles.pillText}>{s}</Text>
                </View>
              ))}
            </View>

            <Pressable style={styles.smallBtn}>
              <Text style={styles.smallBtnText}>설정</Text>
            </Pressable>
          </View>
        )}
      />

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>냉장고 추가</Text>

          <Text style={styles.inputLabel}>냉장고 이름</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="예) 메인 냉장고"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>구역 1</Text>
          <TextInput value={sec1} onChangeText={setSec1} style={styles.input} />

          <Text style={styles.inputLabel}>구역 2</Text>
          <TextInput value={sec2} onChangeText={setSec2} style={styles.input} />

          <Pressable onPress={addFridge} style={styles.primaryBtn}>
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

  card: {
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: "800" },

  sections: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#f1f3ff",
    borderRadius: 999,
  },
  pillText: { color: colors.ACTIVE, fontWeight: "800", fontSize: 12 },

  smallBtn: {
    marginTop: 12,
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  smallBtnText: { color: colors.INACTIVE, fontWeight: "800" },

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
