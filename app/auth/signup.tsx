import CheckPasswordInput from "@/components/CheckPasswordInput";
import DateInputWithCalendar from "@/components/DateInputWithCalendar";
import EmailInput from "@/components/EmailInput";
import FoodThingLogo from "@/components/FoodThingLogo";
import InputField from "@/components/InputField";
import NicknameInput from "@/components/NicknameInput";
import PasswordInput from "@/components/PasswordInput";
import { colors } from "@/constants";
import useAuth from "@/hooks/useAuth";
import { SignUpForm } from "@/types";
import { formatPhoneNumber } from "@/utils/format";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const { signupMutation } = useAuth();
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

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

  const togglePrivacy = () => {
    const next = !privacyAgreed;
    setPrivacyAgreed(next);
    Animated.timing(expandAnim, {
      toValue: next ? 1 : 0,
      duration: 280,
      useNativeDriver: false,
    }).start();
  };

  const sectionHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 280],
  });

  const onSubmit = (formValues: SignUpForm) => {
    if (!privacyAgreed) {
      formValues.name = null;
      formValues.birth = null;
      formValues.phone_num = null;
    }
    signupMutation.mutate(formValues, {
      onError: (error: any) => {
        if (error?.response?.status === 409) {
          signupForm.setError("email", {
            type: "manual",
            message: "이미 가입된 이메일입니다.",
          });
        }
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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

            {/* ── 개인정보 수집 동의 ── */}
            <Pressable style={styles.checkRow} onPress={togglePrivacy}>
              <View style={[styles.checkbox, privacyAgreed && styles.checkboxChecked]}>
                {privacyAgreed && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <Text style={styles.checkLabel}>
                아이디·비밀번호 찾기를 위한 개인정보 수집 동의
              </Text>
            </Pressable>

            {/* ── 본인인증 탭 (동의 시 슬라이드 다운) ── */}
            <Animated.View style={[styles.identitySection, { maxHeight: sectionHeight, overflow: "hidden" }]}>
              <View style={styles.identityHeader}>
                <Ionicons name="person-circle-outline" size={18} color={colors.BLACK} />
                <Text style={styles.identityTitle}>본인인증</Text>
              </View>
              <Text style={styles.identityDesc}>
                이름, 생년월일, 전화번호를 등록하면{"\n"}
                나중에 아이디·비밀번호를 찾을 때 사용됩니다.
              </Text>

              <FormProvider {...signupForm}>
                <View style={styles.identityForm}>
                  <Controller
                    name="name"
                    control={signupForm.control}
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
                    control={signupForm.control}
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
                    control={signupForm.control}
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
              </FormProvider>
            </Animated.View>

            {/* ── 미동의 안내 ── */}
            {!privacyAgreed && (
              <View style={styles.noticeRow}>
                <Ionicons name="information-circle-outline" size={14} color={colors.INACTIVE} />
                <Text style={styles.noticeText}>
                  미동의 시 아이디·비밀번호 찾기가 어려울 수 있습니다.
                </Text>
              </View>
            )}

            <Pressable
              style={[styles.primaryBtn, signupMutation.isPending && styles.disabled]}
              onPress={signupForm.handleSubmit(onSubmit)}
              disabled={signupMutation.isPending}
            >
              <Text style={styles.primaryBtnText}>
                {signupMutation.isPending ? "처리 중…" : "가입하기"}
              </Text>
            </Pressable>

            <Pressable onPress={() => router.replace("/auth")}>
              <Text style={styles.smallMuted}>
                이미 계정이 있나요? 로그인하러 가기
              </Text>
            </Pressable>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
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
  form: {
    gap: 12,
  },

  /* 개인정보 체크박스 행 */
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    marginTop: 4,
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
    backgroundColor: colors.BLACK,
    borderColor: colors.BLACK,
  },
  checkLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: colors.BLACK,
  },

  /* 본인인증 섹션 */
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

  /* 미동의 안내 */
  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
  },
  noticeText: {
    fontSize: 11,
    color: colors.INACTIVE,
    fontWeight: "500",
    flex: 1,
  },

  primaryBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  disabled: { opacity: 0.6 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  smallMuted: {
    textAlign: "center",
    color: "#777",
    fontWeight: "700",
    marginTop: 6,
  },
});
