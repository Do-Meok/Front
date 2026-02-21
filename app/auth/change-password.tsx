import FoodThingLogo from "@/components/FoodThingLogo";
import InputField from "@/components/InputField";
import { colors } from "@/constants";
import useFindInLoginPassword from "@/hooks/auth/useFindInLoginPassword";
import { FindPasswordForm } from "@/types";
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

const MIN_PW_LENGTH = 8;

export default function ChangePasswordScreen() {
  const changePasswordMutation = useFindInLoginPassword();
  const form = useForm<FindPasswordForm>({
    defaultValues: {
      current_password: "",
      new_password: "",
      checked_new_password: "",
    },
  });

  const onSubmit = (values: FindPasswordForm) => {
    if (values.new_password.length < MIN_PW_LENGTH) {
      form.setError("new_password", {
        message: `비밀번호는 ${MIN_PW_LENGTH}자 이상이어야 합니다.`,
      });
      return;
    }
    if (values.new_password !== values.checked_new_password) {
      form.setError("checked_new_password", { message: "비밀번호가 일치하지 않습니다." });
      return;
    }
    changePasswordMutation.mutate(values, {
      onSuccess: () => {
        Alert.alert("완료", "비밀번호가 변경되었습니다.");
        router.back();
      },
      onError: (error: any) => {
        const status = error?.response?.status;
        const message: string =
          error?.response?.data?.message ?? error?.response?.data?.detail ?? "";

        if (
          status === 400 &&
          /현재 비밀번호|current.?password|incorrect|틀린|wrong/i.test(message)
        ) {
          form.setError("current_password", {
            message: "현재 비밀번호가 올바르지 않습니다.",
          });
        } else if (status === 401) {
          form.setError("current_password", {
            message: "현재 비밀번호가 올바르지 않습니다.",
          });
        } else {
          Alert.alert("오류", message || "비밀번호 변경에 실패했습니다.");
        }
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>비밀번호 변경</Text>
        <View style={{ width: 44 }} />
      </View>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.wrap}>
          <FoodThingLogo size={38} />
          <View style={styles.form}>
            <FormProvider {...form}>
              <Controller
                name="current_password"
                control={form.control}
                rules={{ required: "현재 비밀번호를 입력해 주세요." }}
                render={({ field, fieldState }) => (
                  <InputField
                    placeholder="현재 비밀번호"
                    secureTextEntry
                    value={field.value}
                    onChangeText={field.onChange}
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
              style={[
                styles.primaryBtn,
                changePasswordMutation.isPending && styles.disabled,
              ]}
              onPress={form.handleSubmit(onSubmit)}
              disabled={changePasswordMutation.isPending}
            >
              <Text style={styles.primaryBtnText}>
                {changePasswordMutation.isPending ? "처리 중…" : "비밀번호 변경"}
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
  wrap: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 16,
    alignItems: "center",
  },
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
