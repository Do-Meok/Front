import { getUserInfo, login, signup } from "@/api/auth";
import axiosInstance from "@/api/axios";
import { saveSecureStore } from "@/utils/secureStore";
import { useNavigationContext } from "@/providers/NavigationProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
        (data as any)?.data?.accessToken ||
        (data as any)?.data?.access_token ||
        (data as any)?.data?.token;

      const refreshToken =
        data?.refreshToken ||
        data?.refresh_token ||
        (data as any)?.data?.refreshToken ||
        (data as any)?.data?.refresh_token;

      if (token) {
        await saveSecureStore("accessToken", token);
        if (refreshToken) {
          await saveSecureStore("refreshToken", refreshToken);
        }
        await AsyncStorage.removeItem("is_guest");
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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

/** 401 또는 서버 500(토큰 만료 메시지)이면 재시도하지 않음 → 로그인 유도 */
function isTokenOrUnauthorizedError(error: any): boolean {
  const status = error?.response?.status;
  if (status === 401) return true;
  if (status === 500) {
    const msg = String(
      error?.response?.data?.message ?? error?.response?.data?.detail ?? ""
    );
    return /토큰|token|expired|만료/i.test(msg);
  }
  return false;
}

function useUserInfo(enabled: boolean) {
  return useQuery({
    queryKey: ["userInfo"],
    queryFn: getUserInfo,
    enabled,
    retry: (_, error: any) => !isTokenOrUnauthorizedError(error),
  });
}

function useAuth() {
  const { hasToken } = useNavigationContext();
  const signupMutation = useSignUp();
  const loginMutation = useLogin();
  const userInfoQuery = useUserInfo(hasToken === true);

  return {
    signupMutation,
    loginMutation,
    userInfoQuery
  };
}

export default useAuth;
