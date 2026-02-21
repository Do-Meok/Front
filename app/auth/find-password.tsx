import DateInputWithCalendar from "@/components/DateInputWithCalendar";
import InputField from "@/components/InputField";
import { colors } from "@/constants";
import { formatPhoneNumber } from "@/utils/format";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IdentityForm = {
  email: string;
  name: string;
  birth: string;
  phone_num: string;
};

export default function FindPasswordScreen() {
  const form = useForm<IdentityForm>({
    defaultValues: { email: "", name: "", birth: "", phone_num: "" },
  });

  const onSubmit = (values: IdentityForm) => {
    router.push({
      pathname: "/auth/reset-password" as any,
      params: {
        email: values.email,
        name: values.name,
        birth: values.birth,
        phone_num: values.phone_num.replace(/[^0-9]/g, ""),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>비밀번호 찾기</Text>
        <View style={{ width: 44 }} />
      </View>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.stepLabel}>1단계 · 본인 확인</Text>
          <Text style={styles.stepDesc}>
            가입 시 등록한 정보를 입력해 주세요.
          </Text>
          <View style={styles.form}>
            <Controller
              name="email"
              control={form.control}
              rules={{ required: "이메일을 입력해 주세요." }}
              render={({ field, fieldState }) => (
                <InputField
                  placeholder="이메일"
                  inputMode="email"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
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
              rules={{ required: "생년월일을 입력해 주세요." }}
              render={({ field, fieldState }) => (
                <View>
                  <DateInputWithCalendar
                    placeholder="생년월일 (예: 1990-01-01)"
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                  {fieldState.error?.message && (
                    <Text style={styles.fieldError}>{fieldState.error.message}</Text>
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
              style={styles.primaryBtn}
              onPress={form.handleSubmit(onSubmit)}
            >
              <Text style={styles.primaryBtnText}>다음</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.WHITE },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.BLACK,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  kav: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    gap: 8,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.INACTIVE,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.BLACK,
    marginBottom: 8,
  },
  form: { gap: 12 },
  primaryBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.BLACK,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryBtnText: { color: colors.WHITE, fontSize: 16, fontWeight: "800" },
  fieldError: { color: "#e53e3e", fontSize: 12, marginTop: 4, paddingHorizontal: 4 },
});
