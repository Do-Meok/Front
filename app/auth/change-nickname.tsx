import FoodThingLogo from "@/components/FoodThingLogo";
import InputField from "@/components/InputField";
import { colors } from "@/constants";
import useChangeNickname from "@/hooks/auth/useChangeNickname";
import { ChangeNicknameForm } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChangeNicknameScreen() {
  const changeNicknameMutation = useChangeNickname();
  const form = useForm<ChangeNicknameForm>({
    defaultValues: { nickname: "" },
  });

  const onSubmit = (values: ChangeNicknameForm) => {
    changeNicknameMutation.mutate(values, {
      onSuccess: () => router.back(),
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>닉네임 변경</Text>
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
                name="nickname"
                control={form.control}
                rules={{ required: "닉네임을 입력해 주세요." }}
                render={({ field, fieldState }) => (
                  <InputField
                    placeholder="새 닉네임"
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
                changeNicknameMutation.isPending && styles.disabled,
              ]}
              onPress={form.handleSubmit(onSubmit)}
              disabled={changeNicknameMutation.isPending}
            >
              <Text style={styles.primaryBtnText}>
                {changeNicknameMutation.isPending ? "처리 중…" : "변경하기"}
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
