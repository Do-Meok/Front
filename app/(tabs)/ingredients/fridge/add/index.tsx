import DateInputWithCalendar from "@/components/DateInputWithCalendar";
import PageHeader from "@/components/PageHeader";
import useCreateIngredient from "@/hooks/ingredients/useCreateIngredient";
import useUpdateIngredient from "@/hooks/ingredients/useUpdateIngredient";
import { fromKoreanStorageType } from "@/utils/storageType";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function FridgeAddScreen() {
  const [buyDate, setBuyDate] = useState("");
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

      if (data && data.length > 0 && (addStorageType || addExpirationDate)) {
        const ingredientId = data[0].id;
        const updateData: Record<string, any> = {};

        if (addStorageType) {
          const storageType = fromKoreanStorageType(addStorageType);
          if (storageType) updateData.storage_type = storageType;
        }

        if (addExpirationDate) {
          updateData.expiration_date = addExpirationDate;
        }

        if (Object.keys(updateData).length > 0) {
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
    } catch {
      // 에러는 hook에서 처리됨
    }
  };

  return (
    <View style={styles.page}>
      <PageHeader title="냉장고 식재료 넣기" leftChild={<Pressable onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#111" /></Pressable>}/>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.formWrap}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <DateInputWithCalendar
            label="구입날짜"
            value={buyDate}
            onChangeText={setBuyDate}
            placeholder="YYYY-MM-DD"
            helperText="YYYY-MM-DD 형식 (선택사항)"
          />

          <Text style={[styles.inputLabel, { marginTop: 12 }]}>식재료명</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="예) 소고기"
            style={styles.input}
          />

          <View style={{ marginTop: 12 }}>
            <DateInputWithCalendar
              label="유통기한 (YYYY-MM-DD)"
              value={addExpirationDate}
              onChangeText={setAddExpirationDate}
              placeholder="YYYY-MM-DD (선택사항)"
              helperText="유통기한을 입력하세요. (선택사항)"
            />
          </View>

          <Text style={[styles.inputLabel, { marginTop: 12 }]}>보관장소</Text>
          <View style={styles.storageRow}>
            {(["냉장", "냉동", "실온"] as const).map((storageOption) => (
              <Pressable
                key={storageOption}
                onPress={() =>
                  setAddStorageType(
                    addStorageType === storageOption ? "" : storageOption
                  )
                }
                style={[
                  styles.storageBtn,
                  addStorageType === storageOption && styles.storageBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.storageBtnText,
                    addStorageType === storageOption &&
                      styles.storageBtnTextActive,
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
              <>
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.primaryText}>식재료 추가</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
  formWrap: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
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
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
