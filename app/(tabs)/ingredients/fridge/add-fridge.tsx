import PageHeader from "@/components/PageHeader";
import { colors } from "@/constants";
import useAddRefrigerator from "@/hooks/refrigerator/useAddRefrigerator";
import { useFridgeContext } from "@/providers/FridgeProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const COLS_MIN = 1;
const COLS_MAX = 4;
const ROWS_MIN = 1;
const ROWS_MAX = 8;
const CELL_GAP = 8;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function AddFridgeScreen() {
  const { addFridge } = useFridgeContext();
  const addRefrigeratorMutation = useAddRefrigerator();
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

  // 그리드 셀 데이터 생성
  const gridRows = useMemo(() => {
    return Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => `${r}-${c}`)
    );
  }, [rows, cols]);

  const handleComplete = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addRefrigeratorMutation.mutate(
      { name: trimmed, pos_x: cols, pos_y: rows },
      {
        onSuccess: (data) => {
          addFridge({ apiId: data.id, name: trimmed, cols, rows });
          router.back();
        },
      }
    );
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

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

        {/* 미리보기 그리드 */}
        <Text style={styles.previewLabel}>미리보기</Text>
        <View style={styles.gridContainer}>
          <View style={styles.gridInner}>
            {gridRows.map((row, rIdx) => (
              <View key={rIdx} style={styles.gridRow}>
                {row.map((key) => (
                  <View key={key} style={styles.gridCell} />
                ))}
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.gridDesc}>
          {cols} × {rows} ({cols * rows}칸)
        </Text>

        <Pressable
          style={[styles.completeBtn, (!name.trim() || addRefrigeratorMutation.isPending) && styles.completeBtnDisabled]}
          onPress={handleComplete}
          disabled={!name.trim() || addRefrigeratorMutation.isPending}
        >
          <Text style={styles.completeBtnText}>
            {addRefrigeratorMutation.isPending ? "추가 중..." : "완료"}
          </Text>
        </Pressable>
      </ScrollView>
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 32,
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
  previewLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    marginTop: 4,
  },
  gridContainer: {
    alignItems: "center",
    backgroundColor: "#f7f8fa",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  gridInner: {
    gap: CELL_GAP,
  },
  gridRow: {
    flexDirection: "row",
    gap: CELL_GAP,
  },
  gridCell: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#dde0e8",
  },
  gridDesc: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 13,
    color: colors.INACTIVE,
    fontWeight: "600",
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
