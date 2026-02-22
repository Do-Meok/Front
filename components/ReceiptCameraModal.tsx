import { extractReceipt } from "@/api/assistants";
import useCreateIngredient from "@/hooks/ingredients/useCreateIngredient";
import { fmtYYYYMMDD } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Stage = "select" | "preview" | "result";

type ReceiptCameraModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function ReceiptCameraModal({
  visible,
  onClose,
}: ReceiptCameraModalProps) {
  const [stage, setStage] = useState<Stage>("select");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [extractedIngredients, setExtractedIngredients] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const addMutation = useCreateIngredient();

  const reset = () => {
    setStage("select");
    setImageUri(null);
    setExtractedIngredients([]);
    setIsAnalyzing(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const pickFromCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert(
        "카메라 권한 필요",
        "영수증 촬영을 위해 카메라 접근 권한이 필요합니다.\n설정에서 카메라 권한을 허용해 주세요.",
        [{ text: "확인" }],
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setStage("preview");
    }
  };

  const pickFromGallery = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert(
        "사진 접근 권한 필요",
        "영수증 이미지를 선택하려면 사진 라이브러리 접근 권한이 필요합니다.\n설정에서 사진 권한을 허용해 주세요.",
        [{ text: "확인" }],
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setStage("preview");
    }
  };

  const handleAnalyze = async () => {
    if (!imageUri) return;
    setIsAnalyzing(true);
    try {
      const result = await extractReceipt(imageUri);
      setExtractedIngredients(result.ingredients ?? []);
      setStage("result");
    } catch {
      Alert.alert("오류", "영수증 분석에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddIngredients = async () => {
    if (extractedIngredients.length === 0) return;
    try {
      await addMutation.mutateAsync({
        purchase_date: fmtYYYYMMDD(new Date()),
        ingredients: extractedIngredients,
      });
      handleClose();
    } catch {
      // 에러는 hook에서 처리
    }
  };

  const handleBack = () => {
    if (stage === "preview") setStage("select");
    else if (stage === "result") setStage("preview");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={styles.sheet}>
        {/* 헤더 */}
        <View style={styles.sheetTop}>
          <Pressable
            onPress={stage === "select" ? handleClose : handleBack}
            style={styles.closeBtn}
          >
            <Ionicons
              name={stage === "select" ? "close" : "arrow-back"}
              size={20}
              color="#111"
            />
          </Pressable>
          <Text style={styles.sheetTitle}>
            {stage === "select" && "영수증으로 재료 추가"}
            {stage === "preview" && "영수증 확인"}
            {stage === "result" && "추출된 재료"}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        {/* ── select 단계: 카메라/갤러리 선택 ── */}
        {stage === "select" && (
          <View style={styles.selectContainer}>
            <Text style={styles.selectDesc}>
              영수증 이미지를 선택해주세요
            </Text>
            <View style={styles.selectRow}>
              {/* 왼쪽: 카메라 버튼 */}
              <Pressable style={styles.sideBtn} onPress={pickFromCamera}>
                <Ionicons name="camera-outline" size={28} color="#111" />
                <Text style={styles.sideBtnText}>카메라</Text>
              </Pressable>

              {/* 중앙: 이미지 플레이스홀더 */}
              <View style={styles.imagePlaceholder}>
                <Ionicons name="receipt-outline" size={44} color="#ccc" />
                <Text style={styles.placeholderText}>영수증</Text>
              </View>

              {/* 오른쪽: 갤러리 버튼 */}
              <Pressable style={styles.sideBtn} onPress={pickFromGallery}>
                <Ionicons name="image-outline" size={28} color="#111" />
                <Text style={styles.sideBtnText}>갤러리</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── preview 단계: 이미지 미리보기 + 분석 ── */}
        {stage === "preview" && imageUri && (
          <View style={styles.previewContainer}>
            <View style={styles.previewRow}>
              {/* 왼쪽: 카메라 재선택 */}
              <Pressable style={styles.reselectBtn} onPress={pickFromCamera}>
                <Ionicons name="camera-outline" size={22} color="#555" />
              </Pressable>

              {/* 중앙: 선택된 이미지 */}
              <Image
                source={{ uri: imageUri }}
                style={styles.previewImage}
                resizeMode="cover"
              />

              {/* 오른쪽: 갤러리 재선택 */}
              <Pressable style={styles.reselectBtn} onPress={pickFromGallery}>
                <Ionicons name="image-outline" size={22} color="#555" />
              </Pressable>
            </View>

            <Pressable
              style={[styles.primaryBtn, isAnalyzing && styles.primaryBtnDisabled]}
              onPress={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>분석하기</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* ── result 단계: 추출 결과 목록 ── */}
        {stage === "result" && (
          <View style={styles.resultContainer}>
            {extractedIngredients.length === 0 ? (
              <Text style={styles.emptyText}>추출된 재료가 없습니다.</Text>
            ) : (
              <ScrollView
                style={styles.ingredientList}
                showsVerticalScrollIndicator={false}
              >
                {extractedIngredients.map((name, idx) => (
                  <View key={idx} style={styles.ingredientItem}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={16}
                      color="#111"
                    />
                    <Text style={styles.ingredientName}>{name}</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            <Pressable
              style={[
                styles.primaryBtn,
                (addMutation.isPending || extractedIngredients.length === 0) &&
                  styles.primaryBtnDisabled,
              ]}
              onPress={handleAddIngredients}
              disabled={addMutation.isPending || extractedIngredients.length === 0}
            >
              {addMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>
                  {extractedIngredients.length}개 재료 추가하기
                </Text>
              )}
            </Pressable>
          </View>
        )}
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
    marginBottom: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitle: { fontSize: 14, fontWeight: "900" },

  // select 단계
  selectContainer: { paddingVertical: 8 },
  selectDesc: {
    textAlign: "center",
    color: "#666",
    fontSize: 13,
    marginBottom: 20,
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  sideBtn: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
    minWidth: 68,
  },
  sideBtnText: { fontSize: 11, fontWeight: "700", color: "#444" },
  imagePlaceholder: {
    flex: 1,
    height: 160,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderText: { color: "#bbb", fontSize: 12 },

  // preview 단계
  previewContainer: { gap: 12 },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reselectBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      android: { elevation: 1 },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },
  previewImage: {
    flex: 1,
    height: 200,
    borderRadius: 14,
    backgroundColor: "#f0f0f0",
  },

  // result 단계
  resultContainer: { gap: 12 },
  ingredientList: { maxHeight: 200 },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  ingredientName: { fontSize: 14, fontWeight: "700", color: "#111" },
  emptyText: {
    textAlign: "center",
    color: "#888",
    paddingVertical: 24,
    fontSize: 13,
  },

  // 공통
  primaryBtn: {
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryText: { color: "#fff", fontWeight: "900" },
});
