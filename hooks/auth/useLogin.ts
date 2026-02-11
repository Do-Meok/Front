import { login } from "@/api/auth";
import axiosInstance from "@/api/axios";
import { saveSecureStore } from "@/utils/secureStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";

function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      const token =
        data?.access_token ??
        (data as any)?.accessToken ??
        (data as any)?.token;

      const refreshToken =
        data?.refresh_token ?? (data as any)?.refreshToken;

      if (token) {
        await saveSecureStore("accessToken", token);
        if (refreshToken) {
          await saveSecureStore("refreshToken", refreshToken);
        }
        await AsyncStorage.removeItem("is_guest");
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setTimeout(() => router.replace("/(tabs)"), 100);
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

export default useLogin;
