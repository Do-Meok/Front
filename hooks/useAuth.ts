import { login, signup } from "@/api/auth";
import axiosInstance from "@/api/axios";
import { saveSecureStore } from "@/utils/secureStore";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";

function useSignUp() {
  return useMutation({
    mutationFn: signup,
    onSuccess: () => {
      Alert.alert("회원가입 완료", "회원가입이 성공적으로 완료되었습니다.", [
        {
          text: "확인",
          onPress: () => router.replace("/auth"),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert(
        "회원가입 실패",
        error?.response?.data?.message || "회원가입에 실패했습니다."
      );
    },
  });
}

function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      // 토큰 저장 - 다양한 필드명 지원
      const token =
        data?.accessToken ||
        data?.access_token ||
        data?.token ||
        data?.access_token ||
        (data as any)?.data?.accessToken;

      if (token) {
        await saveSecureStore("accessToken", token);
        // axios 인스턴스에 토큰 설정
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        // 토큰 저장 후 약간의 지연을 두고 이동 (토큰이 완전히 저장되도록)
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 100);
      } else {
        console.warn("로그인 응답에 토큰이 없습니다:", data);
        Alert.alert("오류", "로그인 응답에 토큰이 없습니다.");
      }
    },
    onError: (error: any) => {
      Alert.alert(
        "로그인 실패",
        error?.response?.data?.message || "로그인에 실패했습니다."
      );
    },
  });
}

function useAuth() {
  const signupMutation = useSignUp();
  const loginMutation = useLogin();

  return {
    signupMutation,
    loginMutation,
  };
}

export default useAuth;
