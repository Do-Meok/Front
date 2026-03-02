import DateInputWithCalendar from "@/components/DateInputWithCalendar";
import InputField from "@/components/InputField";
import { colors } from "@/constants";
import useUpdateUserInfo from "@/hooks/auth/useUpdateUserInfo";
import { UpdateUserInfoForm } from "@/types";
import { formatPhoneNumber } from "@/utils/format";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FillInfoScreen() {
  const params = useLocalSearchParams<{
    name?: string;
    birth?: string;
    phone_num?: string;
  }>();
  const isEditMode = !!(params.name || params.birth || params.phone_num);

  const updateUserInfoMutation = useUpdateUserInfo();
  const [privacyAgreed, setPrivacyAgreed] = useState(isEditMode);

  const updateForm = useForm<UpdateUserInfoForm>({
    defaultValues: {
      name: params.name ?? "",
      birth: params.birth ?? "",
      phone_num: params.phone_num ?? "",
    },
  });

  const onUpdateSubmit = (data: UpdateUserInfoForm) => {
    if (!privacyAgreed) return;
    updateUserInfoMutation.mutate(data, {
      onSuccess: () => {
        Alert.alert("완료", isEditMode ? "정보가 수정되었습니다." : "정보가 등록되었습니다.", [
          { text: "확인", onPress: () => router.back() },
        ]);
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || "정보 저장에 실패했습니다.";
        Alert.alert("오류", message);
      },
    });
  };

  const togglePrivacy = () => {
    setPrivacyAgreed((prev) => !prev);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={28} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {isEditMode ? "내 정보 수정" : "본인인증 정보 등록"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* ── 개인정보 수집 동의 ── */}
            <Pressable style={styles.checkRow} onPress={togglePrivacy}>
              <View
                style={[
                  styles.checkbox,
                  privacyAgreed && styles.checkboxChecked,
                ]}
              >
                {privacyAgreed && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <Text style={styles.checkLabel}>
                아이디·비밀번호 찾기를 위한 개인정보 수집 동의
              </Text>
            </Pressable>

            <View style={styles.identitySection}>
              <View style={styles.identityHeader}>
                <Ionicons
                  name="person-circle-outline"
                  size={18}
                  color={colors.BLACK}
                />
                <Text style={styles.identityTitle}>필수 정보 입력</Text>
              </View>
              <Text style={styles.identityDesc}>
                이름, 생년월일, 전화번호를 등록하면{"\n"}
                나중에 아이디·비밀번호를 찾을 때 사용됩니다.
              </Text>

              <View style={styles.identityForm}>
                <Controller
                  name="name"
                  control={updateForm.control}
                  render={({ field }) => (
                    <InputField
                      placeholder="이름"
                      value={field.value ?? ""}
                      onChangeText={field.onChange}
                    />
                  )}
                />
                <Controller
                  name="birth"
                  control={updateForm.control}
                  render={({ field }) => (
                    <DateInputWithCalendar
                      value={field.value ?? ""}
                      onChangeText={field.onChange}
                      placeholder="생년월일 (예: 1990-01-01)"
                    />
                  )}
                />
                <Controller
                  name="phone_num"
                  control={updateForm.control}
                  render={({ field }) => (
                    <InputField
                      placeholder="전화번호 (예: 010-1234-5678)"
                      value={field.value ?? ""}
                      onChangeText={(text) => {
                        const formatted = formatPhoneNumber(text);
                        field.onChange(formatted);
                      }}
                      keyboardType="phone-pad"
                      maxLength={13}
                    />
                  )}
                />
              </View>

              <Pressable
                style={[
                  styles.primaryBtn,
                  (!privacyAgreed || updateUserInfoMutation.isPending) &&
                    styles.disabled,
                ]}
                onPress={updateForm.handleSubmit(onUpdateSubmit)}
                disabled={!privacyAgreed || updateUserInfoMutation.isPending}
              >
                <Text style={styles.primaryBtnText}>
                  {updateUserInfoMutation.isPending
                    ? "저장 중…"
                    : isEditMode
                      ? "수정하기"
                      : "저장하기"}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.BLACK,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    backgroundColor: "#fff",
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: colors.PRIMARY,
    borderColor: colors.PRIMARY,
  },
  checkLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: colors.BLACK,
  },
  identitySection: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#ececec",
  },
  identityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  identityTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.BLACK,
  },
  identityDesc: {
    fontSize: 12,
    color: colors.INACTIVE,
    fontWeight: "500",
    lineHeight: 18,
  },
  identityForm: {
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  disabled: { opacity: 0.6 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },
});
