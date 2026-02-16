import PageHeader from "@/components/PageHeader";
import { colors } from "@/constants";
import { useFridgeContext } from "@/providers/FridgeProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const COLS_MIN = 1;
const COLS_MAX = 4;
const ROWS_MIN = 1;
const ROWS_MAX = 8;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function AddFridgeScreen() {
  const { addFridge } = useFridgeContext();
  const [name, setName] = useState("");
  const [colsStr, setColsStr] = useState("3");
  const [rowsStr, setRowsStr] = useState("3");

  const cols = clamp(
    parseInt(colsStr, 10) || COLS_MIN,
    COLS_MIN,
    COLS_MAX
  );
  const rows = clamp(
    parseInt(rowsStr, 10) || ROWS_MIN,
    ROWS_MIN,
    ROWS_MAX
  );

  const handleComplete = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addFridge({
      name: trimmed,
      cols,
      rows,
    });
    router.back();
  };

  return (
    <View style={styles.page}>
      <PageHeader
        title="냉장고 추가"
        leftChild={
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>
        }
      />

      <View style={styles.form}>
        <Text style={styles.label}>냉장고의 이름을 설정해주세요</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="예) 메인 냉장고"
          placeholderTextColor="#999"
          style={styles.input}
        />

        <View style={styles.row}>
          <Text style={styles.labelInline}>가로</Text>
          <TextInput
            value={colsStr}
            onChangeText={setColsStr}
            keyboardType="number-pad"
            style={styles.inputSmall}
            placeholder="1~4"
          />
          <Text style={styles.unit}>칸</Text>
        </View>
        <Text style={styles.hint}>가로 최소 1이상 최대 4까지</Text>

        <View style={styles.row}>
          <Text style={styles.labelInline}>세로</Text>
          <TextInput
            value={rowsStr}
            onChangeText={setRowsStr}
            keyboardType="number-pad"
            style={styles.inputSmall}
            placeholder="1~8"
          />
          <Text style={styles.unit}>칸</Text>
        </View>
        <Text style={styles.hint}>세로 최소 1이상 최대 8까지</Text>

        <Pressable
          style={[styles.completeBtn, !name.trim() && styles.completeBtnDisabled]}
          onPress={handleComplete}
          disabled={!name.trim()}
        >
          <Text style={styles.completeBtnText}>완료</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.WHITE,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  form: {
    paddingTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  labelInline: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 20,
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minWidth: 56,
    marginRight: 8,
  },
  unit: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: colors.INACTIVE,
    marginBottom: 16,
  },
  completeBtn: {
    marginTop: 24,
    backgroundColor: colors.BLACK,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  completeBtnDisabled: {
    backgroundColor: "#ccc",
  },
  completeBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});
