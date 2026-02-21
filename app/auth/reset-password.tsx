import InputField from "@/components/InputField";
import { colors } from "@/constants";
import useFindPassword from "@/hooks/auth/useFindPassword";
import { ResetPasswordForm } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
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

type NewPasswordForm = {
  new_password: string;
  checked_new_password: string;
};

const MIN_PW_LENGTH = 8;

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{
    email: string;
    name: string;
    birth: string;
    phone_num: string;
  }>();
  const findPasswordMutation = useFindPassword();

  const form = useForm<NewPasswordForm>({
    defaultValues: { new_password: "", checked_new_password: "" },
  });

  const onSubmit = (values: NewPasswordForm) => {
    if (values.new_password.length < MIN_PW_LENGTH) {
      form.setError("new_password", {
        message: `비밀번호는 ${MIN_PW_LENGTH}자 이상이어야 합니다.`,
      });
      return;
    }
    if (values.new_password !== values.checked_new_password) {
      form.setError("checked_new_password", {
        message: "비밀번호가 일치하지 않습니다.",
      });
      return;
    }

    const payload: ResetPasswordForm = {
      email: params.email ?? "",
      name: params.name ?? "",
      birth: params.birth ?? "",
      phone_num: (params.phone_num ?? "").replace(/[^0-9]/g, ""),
      new_password: values.new_password,
      checked_new_password: values.checked_new_password,
    };

    findPasswordMutation.mutate(payload, {
      onSuccess: () => {
        Alert.alert("완료", "비밀번호가 재설정되었습니다.\n새 비밀번호로 로그인해 주세요.", [
          { text: "로그인하러 가기", onPress: () => router.replace("/auth/login") },
        ]);
      },
      onError: (error: any) => {
        const status = error?.response?.status;
        const message: string =
          error?.response?.data?.message ?? error?.response?.data?.detail ?? "";

        if (status === 404 || /찾을 수 없|not found/i.test(message)) {
          Alert.alert("오류", "입력한 정보와 일치하는 계정을 찾을 수 없습니다.\n앞 단계로 돌아가 다시 확인해 주세요.");
        } else if (status === 400 || /비밀번호|password/i.test(message)) {
          form.setError("new_password", {
            message: message || "비밀번호 형식이 올바르지 않습니다.",
          });
        } else {
          Alert.alert("오류", message || "비밀번호 재설정에 실패했습니다.");
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
          <Text style={styles.stepLabel}>2단계 · 새 비밀번호 설정</Text>
          <Text style={styles.stepDesc}>사용할 새 비밀번호를 입력해 주세요.</Text>
          <View style={styles.form}>
            <Controller
              name="new_password"
              control={form.control}
              rules={{
                required: "새 비밀번호를 입력해 주세요.",
                minLength: {
                  value: MIN_PW_LENGTH,
                  message: `비밀번호는 ${MIN_PW_LENGTH}자 이상이어야 합니다.`,
                },
              }}
              render={({ field, fieldState }) => (
                <InputField
                  placeholder="새 비밀번호 (8자 이상)"
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
                  onChangeText={(text) => {
                    field.onChange(text);
                    if (form.formState.errors.checked_new_password) {
                      form.clearErrors("checked_new_password");
                    }
                  }}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Pressable
              style={[
                styles.primaryBtn,
                findPasswordMutation.isPending && styles.disabled,
              ]}
              onPress={form.handleSubmit(onSubmit)}
              disabled={findPasswordMutation.isPending}
            >
              <Text style={styles.primaryBtnText}>
                {findPasswordMutation.isPending ? "처리 중…" : "비밀번호 재설정"}
              </Text>
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
  headerTitle: { fontSize: 17, fontWeight: "800", color: colors.BLACK },
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
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
  disabled: { opacity: 0.6 },
});
