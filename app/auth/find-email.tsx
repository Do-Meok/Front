import BackHeader from "@/components/BackHeader";
import DateInputWithCalendar from "@/components/DateInputWithCalendar";
import InputField from "@/components/InputField";
import { colors } from "@/constants";
import useFindEmail from "@/hooks/auth/useFindEmail";
import { FindEmailForm } from "@/types";
import { formatPhoneNumber } from "@/utils/format";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FindEmailScreen() {
  const findEmailMutation = useFindEmail();
  const [foundEmail, setFoundEmail] = useState<string | null>(null);
  const form = useForm<FindEmailForm>({
    defaultValues: { name: "", birth: "", phone_num: "" },
  });

  const onSubmit = (values: FindEmailForm) => {
    const payload: FindEmailForm = {
      name: values.name.trim(),
      birth: values.birth.trim(),
      phone_num: values.phone_num.replace(/[^0-9]/g, ""),
    };
    findEmailMutation.mutate(payload, {
      onSuccess: (data) => {
        setFoundEmail(data.email);
      },
      onError: (error: any) => {
        const errData = error?.response?.data;
        let message = "";
        if (typeof errData?.message === "string") {
          message = errData.message;
        } else if (typeof errData?.detail === "string") {
          message = errData.detail;
        } else if (Array.isArray(errData?.detail)) {
          message = errData.detail
            .map((d: any) => d.msg ?? d.message ?? "")
            .filter(Boolean)
            .join("\n");
        }
        Alert.alert("오류", message || "일치하는 계정을 찾을 수 없습니다.");
      },
    });
  };

  const handleCopy = async () => {
    if (!foundEmail) return;
    await Clipboard.setStringAsync(foundEmail);
    Alert.alert("복사 완료", "이메일이 클립보드에 복사되었습니다.");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <BackHeader onBack={() => router.back()} />
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.wrap}>
          <View style={styles.titleBox}>
            <Text style={styles.title}>이메일 찾기</Text>
            <Text style={styles.subtitle}>
              가입 시 등록한 정보를 입력해 주세요.
            </Text>
          </View>

          <View style={styles.form}>
            <Controller
              name="name"
              control={form.control}
              rules={{ required: "이름을 입력해 주세요." }}
              render={({ field, fieldState }) => (
                <InputField
                  placeholder="이름"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="birth"
              control={form.control}
              rules={{
                required: "생년월일을 입력해 주세요.",
                pattern: {
                  value: /^\d{4}-\d{2}-\d{2}$/,
                  message: "생년월일 형식이 올바르지 않습니다. (예: 1990-01-01)",
                },
              }}
              render={({ field, fieldState }) => (
                <View>
                  <DateInputWithCalendar
                    placeholder="생년월일 (예: 1990-01-01)"
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                  {fieldState.error?.message && (
                    <Text style={styles.fieldError}>
                      {fieldState.error.message}
                    </Text>
                  )}
                </View>
              )}
            />
            <Controller
              name="phone_num"
              control={form.control}
              rules={{ required: "전화번호를 입력해 주세요." }}
              render={({ field, fieldState }) => (
                <InputField
                  placeholder="전화번호 (예: 010-1234-5678)"
                  value={field.value}
                  onChangeText={(text) => field.onChange(formatPhoneNumber(text))}
                  keyboardType="phone-pad"
                  maxLength={13}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Pressable
              style={[styles.primaryBtn, findEmailMutation.isPending && styles.disabled]}
              onPress={form.handleSubmit(onSubmit)}
              disabled={findEmailMutation.isPending}
            >
              <Text style={styles.primaryBtnText}>
                {findEmailMutation.isPending ? "처리 중…" : "이메일 찾기"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* 이메일 결과 모달 */}
      <Modal
        visible={!!foundEmail}
        transparent
        animationType="fade"
        onRequestClose={() => setFoundEmail(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setFoundEmail(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalIconRow}>
              <Ionicons name="mail-outline" size={32} color={colors.BLACK} />
            </View>
            <Text style={styles.modalTitle}>이메일 찾기 완료</Text>
            <Text style={styles.modalDesc}>가입된 이메일 주소입니다.</Text>

            <View style={styles.emailBox}>
              <Text style={styles.emailText} selectable>
                {foundEmail}
              </Text>
            </View>

            <View style={styles.modalBtnRow}>
              <Pressable style={styles.copyBtn} onPress={handleCopy}>
                <Ionicons name="copy-outline" size={16} color={colors.WHITE} />
                <Text style={styles.copyBtnText}>복사하기</Text>
              </Pressable>
              <Pressable
                style={styles.loginBtn}
                onPress={() => {
                  setFoundEmail(null);
                  router.replace("/auth/login");
                }}
              >
                <Text style={styles.loginBtnText}>로그인하러 가기</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.WHITE },
  kav: { flex: 1 },
  wrap: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 24,
    alignItems: "center",
  },
  titleBox: { alignItems: "center", gap: 6 },
  title: { fontSize: 22, fontWeight: "800", color: colors.BLACK },
  subtitle: { fontSize: 14, fontWeight: "500", color: colors.INACTIVE, textAlign: "center" },
  form: { width: "100%", maxWidth: 420, gap: 12 },
  fieldError: { color: "#e53e3e", fontSize: 12, marginTop: 4, paddingHorizontal: 4 },
  primaryBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.BLACK,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryBtnText: { color: colors.WHITE, fontSize: 16, fontWeight: "800" },
  disabled: { opacity: 0.6 },

  /* 모달 */
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.WHITE,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  modalIconRow: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.BLACK },
  modalDesc: { fontSize: 13, fontWeight: "500", color: colors.INACTIVE },
  emailBox: {
    width: "100%",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ececec",
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 6,
  },
  emailText: { fontSize: 16, fontWeight: "700", color: colors.BLACK },
  modalBtnRow: { flexDirection: "row", gap: 10, marginTop: 8, width: "100%" },
  copyBtn: {
    flex: 1,
    flexDirection: "row",
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.BLACK,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  copyBtnText: { color: colors.WHITE, fontSize: 14, fontWeight: "700" },
  loginBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: { fontSize: 14, fontWeight: "700", color: colors.BLACK },
});
