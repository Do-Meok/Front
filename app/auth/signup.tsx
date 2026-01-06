import CheckPasswordInput from "@/components/CheckPasswordInput";
import EmailInput from "@/components/EmailInput";
import FoodThingLogo from "@/components/FoodThingLogo";
import NicknameInput from "@/components/NicknameInput";
import PasswordInput from "@/components/PasswordInput";
import useAuth from "@/hooks/useAuth";
import { SignUpForm } from "@/types";
import { router } from "expo-router";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
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

export default function SignUpScreen() {
  const { signupMutation } = useAuth();
  const signupForm = useForm<SignUpForm>({
    defaultValues: {
      email: "",
      password: "",
      checked_password: "",
      nickname: "",
      name: null,
      birth: null,
      phone_num: null,
    },
  });
  const onSubmit = (formValues: SignUpForm) => {
    // 확인용
    Alert.alert("submit", JSON.stringify(formValues, null, 2));
    signupMutation.mutate(formValues);
    router.replace("/auth");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <FoodThingLogo size={38} />

          <View style={styles.card}>
            <FormProvider {...signupForm}>
              <View style={styles.form}>
                <NicknameInput />
                <EmailInput />
                <PasswordInput />
                <CheckPasswordInput />
              </View>
            </FormProvider>

            <Pressable
              style={styles.primaryBtn}
              onPress={signupForm.handleSubmit(onSubmit)}
            >
              <Text style={styles.primaryBtnText}>가입하기</Text>
            </Pressable>

            <Pressable onPress={() => router.replace("/auth")}>
              <Text style={styles.smallMuted}>
                이미 계정이 있나요? 로그인하러 가기
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  kav: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },

  back: { fontSize: 26, fontWeight: "800", color: "#111", width: 40 },
  title: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "900",
    color: "#111",
  },

  form: {
    gap: 12,
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
  },
  primaryBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  smallMuted: {
    textAlign: "center",
    color: "#777",
    fontWeight: "700",
    marginTop: 6,
  },
});
