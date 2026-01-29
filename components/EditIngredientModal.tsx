import DateInputWithCalendar from "@/components/DateInputWithCalendar";
import useUpdateIngredient from "@/hooks/useUpdateIngredient";
import { GetIngredientResponse } from "@/types";
import { fromKoreanStorageType, toKoreanStorageType } from "@/utils/storageType";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type EditIngredientModalProps = {
  visible: boolean;
  ingredient: GetIngredientResponse | null;
  onClose: () => void;
};

export default function EditIngredientModal({
  visible,
  ingredient,
  onClose,
}: EditIngredientModalProps) {
  const [editName, setEditName] = useState("");
  const [editExpirationDate, setEditExpirationDate] = useState("");
  const [editStorageType, setEditStorageType] = useState<string>("");

  const updateMutation = useUpdateIngredient();

  useEffect(() => {
    if (ingredient) {
      setEditName(ingredient.ingredient_name);
      setEditExpirationDate(ingredient.expiration_date || "");
      setEditStorageType(
        ingredient.storage_type ? toKoreanStorageType(ingredient.storage_type) : ""
      );
    }
  }, [ingredient]);

  const handleUpdate = () => {
    if (!ingredient) return;

    const updateData: any = {};
    if (editExpirationDate) updateData.expiration_date = editExpirationDate;
    if (editStorageType) {
      const storageType = fromKoreanStorageType(editStorageType);
      if (storageType) updateData.storage_type = storageType;
    }

    updateMutation.mutate(
      {
        ingredientId: ingredient.id,
        data: updateData,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetTop}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#111" />
          </Pressable>
          <Text style={styles.sheetTitle}>수정</Text>
          <View style={{ width: 32 }} />
        </View>

        <Text style={styles.inputLabel}>식재료명</Text>
        <TextInput
          value={editName}
          editable={false}
          style={[styles.input, { backgroundColor: "#f5f5f5" }]}
        />

        <View style={{ marginTop: 12 }}>
          <DateInputWithCalendar
            label="유통기한 (YYYY-MM-DD)"
            value={editExpirationDate}
            onChangeText={setEditExpirationDate}
            placeholder="YYYY-MM-DD"
            helperText="유통기한을 수정하려면 입력하세요. 빈 값으로 두면 기존 값이 유지됩니다."
          />
        </View>

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>보관장소</Text>
        <View style={styles.storageRow}>
          {(["냉장", "냉동", "실온"] as const).map((s) => (
            <Pressable
              key={s}
              onPress={() => setEditStorageType(editStorageType === s ? "" : s)}
              style={[
                styles.storageBtn,
                editStorageType === s && styles.storageBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.storageBtnText,
                  editStorageType === s && styles.storageBtnTextActive,
                ]}
              >
                {s}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.helper}>
          보관장소를 수정하려면 선택하세요. 다시 클릭하면 취소됩니다.
        </Text>

        <Pressable
          onPress={handleUpdate}
          style={[
            styles.primaryBtn,
            updateMutation.isPending && styles.primaryBtnDisabled,
          ]}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>수정</Text>
          )}
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    maxHeight: "80%",
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
  input: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  helper: { marginTop: 6, fontSize: 11, color: "#888" },
  storageRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  storageBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    backgroundColor: "#fff",
  },
  storageBtnActive: {
    backgroundColor: "#f2f4ff",
    borderColor: "#d9dcff",
  },
  storageBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
  },
  storageBtnTextActive: {
    color: "#111",
  },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryText: { color: "#fff", fontWeight: "900" },
});
