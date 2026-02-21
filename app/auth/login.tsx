import BackHeader from "@/components/BackHeader";
import EmailInput from "@/components/EmailInput";
import FoodThingLogo from "@/components/FoodThingLogo";
import PasswordInput from "@/components/PasswordInput";
import { colors } from "@/constants";
import useAuth from "@/hooks/useAuth";
import { LoginForm } from "@/types";
import { router } from "expo-router";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginFormScreen() {
  const { loginMutation } = useAuth();
  const loginForm = useForm<LoginForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onPressLogin = (formValues: LoginForm) => {
    loginMutation.mutate(formValues);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <BackHeader onBack={() => router.back()} />
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.wrap}>
          <View style={styles.logoBox}>
            <FoodThingLogo size={44} />
          </View>

          <View style={styles.form}>
            <FormProvider {...loginForm}>
              <EmailInput />
              <PasswordInput />
            </FormProvider>

            <Pressable
              style={styles.primaryBtn}
              onPress={loginForm.handleSubmit(onPressLogin)}
            >
              <Text style={styles.primaryBtnText}>로그인</Text>
            </Pressable>

            <View style={styles.actionRow}>
              <Pressable
                style={styles.actionBtn}
                onPress={() => router.push("/auth/signup")}
              >
                <Text style={styles.actionBtnText}>회원가입</Text>
              </Pressable>
              <Pressable
                style={styles.actionBtn}
                onPress={() => router.push("/auth/account-recovery")}
              >
                <Text style={styles.actionBtnText}>계정찾기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  kav: {
    flex: 1,
  },
  wrap: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 18,
    alignItems: "center",
  },
  logoBox: {
    alignItems: "center",
  },
  form: {
    width: "100%",
    maxWidth: 420,
    gap: 10,
  },
  primaryBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.BORDER,
    backgroundColor: colors.WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.BLACK,
  },
});
