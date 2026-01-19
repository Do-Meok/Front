import useCreateIngredient from "@/hooks/useCreateIngredient";
import useUpdateIngredient from "@/hooks/useUpdateIngredient";
import { StorageType } from "@/types";
import { addDays, fmtYYYYMMDD } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type AddIngredientModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function AddIngredientModal({
  visible,
  onClose,
}: AddIngredientModalProps) {
  const [buyDate, setBuyDate] = useState(fmtYYYYMMDD(new Date()));
  const [name, setName] = useState("");
  const [addStorageType, setAddStorageType] = useState<StorageType | "">("");
  const [addExpirationDate, setAddExpirationDate] = useState("");

  const addMutation = useCreateIngredient();
  const updateMutation = useUpdateIngredient();

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert("알림", "식재료명을 입력해주세요.");
      return;
    }
    // 날짜가 없으면 오늘 날짜로 설정
    const purchaseDate = buyDate.trim() || fmtYYYYMMDD(new Date());

    try {
      const data = await addMutation.mutateAsync({
        purchase_date: purchaseDate,
        ingredients: [name.trim()],
      });

      // 추가된 식재료가 있고, 스토리지 타입이나 유통기한이 설정되어 있으면 상세 정보 설정
      if (data && data.length > 0 && (addStorageType || addExpirationDate)) {
        const ingredientId = data[0].id;
        // 스토리지 타입과 유통기한 둘 다 필수이므로, 하나만 있으면 다른 하나는 기본값 사용
        const storageType = addStorageType || "냉장"; // 기본값
        const expirationDate =
          addExpirationDate || addDays(fmtYYYYMMDD(new Date()), 7); // 기본값: 7일 후

        // updateMutation을 사용하여 상세 정보 설정
        await updateMutation.mutateAsync({
          ingredientId,
          data: {
            storage_type: storageType as StorageType,
            expiration_date: expirationDate,
          },
        });
      }

      setName("");
      setBuyDate(fmtYYYYMMDD(new Date()));
      setAddStorageType("");
      setAddExpirationDate("");
      onClose();
    } catch {
      // 에러는 hook에서 처리됨
    }
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
          <Pressable style={styles.plusMini} onPress={handleAdd}>
            <Ionicons name="add" size={18} color="#111" />
          </Pressable>
        </View>

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>
          유통기한 (YYYY-MM-DD)
        </Text>
        <TextInput
          value={addExpirationDate}
          onChangeText={setAddExpirationDate}
          placeholder="YYYY-MM-DD (선택사항)"
          style={styles.input}
        />
        <Text style={styles.helper}>
          유통기한을 입력하세요. 입력하지 않으면 기본값(7일 후)이 설정됩니다.
        </Text>

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>보관장소</Text>
        <View style={styles.storageRow}>
          {(["냉장", "냉동", "실온"] as StorageType[]).map((s) => (
            <Pressable
              key={s}
              onPress={() => setAddStorageType(addStorageType === s ? "" : s)}
              style={[
                styles.storageBtn,
                addStorageType === s && styles.storageBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.storageBtnText,
                  addStorageType === s && styles.storageBtnTextActive,
                ]}
              >
                {s}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.helper}>
          보관장소를 선택하세요. 선택하지 않으면 기본값(냉장)이 설정됩니다.
        </Text>

        <Pressable
          onPress={handleAdd}
          style={[
            styles.primaryBtn,
            addMutation.isPending && styles.primaryBtnDisabled,
          ]}
          disabled={addMutation.isPending}
        >
          {addMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>추가</Text>
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
