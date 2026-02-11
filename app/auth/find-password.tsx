import FoodThingLogo from "@/components/FoodThingLogo";
import InputField from "@/components/InputField";
import { colors } from "@/constants";
import useFindPassword from "@/hooks/auth/useFindPassword";
import { ResetPasswordForm } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FindPasswordScreen() {
  const findPasswordMutation = useFindPassword();
  const form = useForm<ResetPasswordForm>({
    defaultValues: {
      email: "",
      name: "",
      birth: "",
      phone_num: "",
      new_password: "",
      checked_new_password: "",
    },
  });

  const onSubmit = (values: ResetPasswordForm) => {
    if (values.new_password !== values.checked_new_password) {
      form.setError("checked_new_password", { message: "비밀번호가 일치하지 않습니다." });
      return;
    }
    findPasswordMutation.mutate(values, {
      onSuccess: () => {
        Alert.alert("완료", "비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해 주세요.");
        router.replace("/auth/login");
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={28} color="#111" />
      </Pressable>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.wrap}>
          <FoodThingLogo size={38} />
          <Text style={styles.title}>비밀번호 찾기</Text>
          <View style={styles.form}>
            <FormProvider {...form}>
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
                  <InputField
                    placeholder="생년월일 (예: 1990-01-01)"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="phone_num"
                control={form.control}
                rules={{ required: "전화번호를 입력해 주세요." }}
                render={({ field, fieldState }) => (
                  <InputField
                    placeholder="전화번호"
                    value={field.value}
                    onChangeText={field.onChange}
                    keyboardType="phone-pad"
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="new_password"
                control={form.control}
                rules={{ required: "새 비밀번호를 입력해 주세요." }}
                render={({ field, fieldState }) => (
                  <InputField
                    placeholder="새 비밀번호"
                    secureTextEntry
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="checked_new_password"
                control={form.control}
                rules={{ required: "비밀번호 확인을 입력해 주세요." }}
                render={({ field, fieldState }) => (
                  <InputField
                    placeholder="새 비밀번호 확인"
                    secureTextEntry
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </FormProvider>
            <Pressable
              style={[styles.primaryBtn, findPasswordMutation.isPending && styles.disabled]}
              onPress={form.handleSubmit(onSubmit)}
              disabled={findPasswordMutation.isPending}
            >
              <Text style={styles.primaryBtnText}>
                {findPasswordMutation.isPending ? "처리 중…" : "비밀번호 재설정"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.WHITE },
  backBtn: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  kav: { flex: 1 },
  wrap: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    gap: 16,
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "800", color: colors.BLACK },
  form: { width: "100%", maxWidth: 420, gap: 12 },
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
});
