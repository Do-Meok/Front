import EmailInput from "@/components/EmailInput";
import FoodThingLogo from "@/components/FoodThingLogo";
import PasswordInput from "@/components/PasswordInput";
import { colors } from "@/constants";
import useAuth from "@/hooks/useAuth";
import { LoginForm } from "@/types";
import { Ionicons } from "@expo/vector-icons";
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
      {/* 뒤로가기 버튼 - 왼쪽 위 */}
      <Pressable
        onPress={() => {
          // AuthButton 화면으로 돌아가기
          router.back();
        }}
        hitSlop={12}
        style={styles.backBtn}
      >
        <Ionicons name="chevron-back" size={28} color="#111" />
      </Pressable>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.wrap}>
          {/* 로고 */}
          <View style={styles.logoBox}>
            <FoodThingLogo size={44} />
          </View>

          {/* 입력 */}
          <View style={styles.form}>
            <FormProvider {...loginForm}>
              <EmailInput />
              <PasswordInput />
            </FormProvider>

            {/* 로그인 버튼 */}
            <Pressable
              style={[styles.primaryBtn]}
              onPress={loginForm.handleSubmit(onPressLogin)}
            >
              <Text style={styles.primaryBtnText}>로그인</Text>
            </Pressable>

            {/* 회원가입 / 비밀번호 찾기 */}
            <View style={styles.row}>
              <Pressable onPress={() => router.push("/auth/signup")}>
                <Text style={styles.link}>회원가입</Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  Alert.alert("임시", "비밀번호 찾기 화면을 붙이면 돼요")
                }
              >
                <Text style={styles.link}>비밀번호 찾기</Text>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  link: { fontSize: 14, fontWeight: "800", color: "#111" },
});
