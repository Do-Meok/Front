import DateInputWithCalendar from "@/components/DateInputWithCalendar";
import useCreateIngredient from "@/hooks/ingredients/useCreateIngredient";
import useUpdateIngredient from "@/hooks/ingredients/useUpdateIngredient";
import { fmtYYYYMMDD } from "@/utils/date";
import { fromKoreanStorageType } from "@/utils/storageType";
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
  const [addStorageType, setAddStorageType] = useState<string>("");
  const [addExpirationDate, setAddExpirationDate] = useState("");

  const addMutation = useCreateIngredient();
  const updateMutation = useUpdateIngredient({ showAlert: false });

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert("알림", "식재료명을 입력해주세요.");
      return;
    }
    const purchaseDate = buyDate.trim();

    try {
      const data = await addMutation.mutateAsync({
        purchase_date: purchaseDate,
        ingredients: [name.trim()],
      });

      // 추가된 식재료가 있고, 스토리지 타입이나 유통기한이 설정되어 있으면 상세 정보 설정
      if (data && data.length > 0 && (addStorageType || addExpirationDate)) {
        const ingredientId = data[0].id;
        const updateData: any = {};

        if (addStorageType) {
          const storageType = fromKoreanStorageType(addStorageType);
          if (storageType) updateData.storage_type = storageType;
        }

        if (addExpirationDate) {
          updateData.expiration_date = addExpirationDate;
        }

        // updateMutation을 사용하여 상세 정보 설정
        if (Object.keys(updateData).length > 0) {
          // updateMutation 호출 (alert는 표시하지 않음, 추가 성공 alert만 표시)
          await updateMutation.mutateAsync({
            ingredientId,
            data: updateData,
          });
        }
      }

      setName("");
      setBuyDate("");
      setAddStorageType("");
      setAddExpirationDate("");
      onClose();
      // 성공 알림은 hook에서 처리됨
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

        <DateInputWithCalendar
          label="구입날짜"
          value={buyDate}
          onChangeText={setBuyDate}
          placeholder="YYYY-MM-DD"
          helperText="기본값은 오늘 날짜로 설정됩니다."
        />

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>식재료명</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="예) 소고기"
            style={[styles.input, { flex: 1 }]}
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <DateInputWithCalendar
            label="유통기한 (선택사항)"
            value={addExpirationDate}
            onChangeText={setAddExpirationDate}
            placeholder="YYYY-MM-DD"
            helperText="유통기한을 입력하세요. (선택사항)"
          />
        </View>

        <Text style={[styles.inputLabel, { marginTop: 12 }]}>보관장소</Text>
        <View style={styles.storageRow}>
          {(["냉장", "냉동", "실온"] as const).map((storageOption) => (
            <Pressable
              key={storageOption}
              onPress={() => setAddStorageType(addStorageType === storageOption ? "" : storageOption)}
              style={[
                styles.storageBtn,
                addStorageType === storageOption && styles.storageBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.storageBtnText,
                  addStorageType === storageOption && styles.storageBtnTextActive,
                ]}
              >
                {storageOption}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.helper}>
          보관장소를 선택하세요. (선택사항)
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
