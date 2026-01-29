import { getUserInfo, login, signup } from "@/api/auth";
import axiosInstance from "@/api/axios";
import { saveSecureStore } from "@/utils/secureStore";
import { useMutation, useQuery } from "@tanstack/react-query";
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
      const status = error?.response?.status;
      const message =
        status === 409
          ? "이미 가입된 이메일입니다. 로그인하거나 다른 이메일을 사용해 주세요."
          : error?.response?.data?.message || "회원가입에 실패했습니다.";
      Alert.alert("회원가입 실패", message);
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
      const status = error?.response?.status;
      const serverMessage = error?.response?.data?.message;

      const message =
        serverMessage ||
        (status === 404
          ? "등록되지 않은 이메일입니다. 이메일을 확인해 주세요."
          : status === 401
            ? "이메일 또는 비밀번호를 확인해 주세요."
            : "로그인에 실패했습니다.");

      Alert.alert("로그인 실패", message);
    },
  });
}

function useUserInfo() {
  return useQuery({
    queryKey: ["userInfo"],
    queryFn: getUserInfo,
    retry: (_, error: any) => error?.response?.status !== 401,
  });
}

function useAuth() {
  const signupMutation = useSignUp();
  const loginMutation = useLogin();
  const userInfoQuery = useUserInfo();

  return {
    signupMutation,
    loginMutation,
    userInfoQuery
  };
}

export default useAuth;
