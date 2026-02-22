import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type AddMethodModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectReceipt: () => void;
  onSelectManual: () => void;
};

export default function AddMethodModal({
  visible,
  onClose,
  onSelectReceipt,
  onSelectManual,
}: AddMethodModalProps) {
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
          <Text style={styles.sheetTitle}>재료 추가 방법</Text>
          <View style={{ width: 32 }} />
        </View>

        <Text style={styles.desc}>재료를 어떻게 추가할까요?</Text>

        <Pressable style={styles.optionBtn} onPress={onSelectReceipt}>
          <View style={styles.optionIcon}>
            <Ionicons name="receipt-outline" size={22} color="#111" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>영수증으로 추가</Text>
            <Text style={styles.optionDesc}>
              카메라나 갤러리로 영수증을 찍어 자동 인식
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#aaa" />
        </Pressable>

        <Pressable
          style={[styles.optionBtn, { marginTop: 8 }]}
          onPress={onSelectManual}
        >
          <View style={styles.optionIcon}>
            <Ionicons name="create-outline" size={22} color="#111" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>직접 입력</Text>
            <Text style={styles.optionDesc}>재료명을 직접 입력하여 추가</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#aaa" />
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
  },
  sheetTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitle: { fontSize: 14, fontWeight: "900" },
  desc: { color: "#666", fontSize: 13, marginBottom: 12 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  optionTitle: { fontSize: 14, fontWeight: "800", color: "#111" },
  optionDesc: { fontSize: 11, color: "#888", marginTop: 2 },
});
