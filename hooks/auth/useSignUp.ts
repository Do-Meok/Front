import { signup } from "@/api/auth";
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
      const status = error?.response?.status;
      const message =
        status === 409
          ? "이미 가입된 이메일입니다. 로그인하거나 다른 이메일을 사용해 주세요."
          : error?.response?.data?.message || "회원가입에 실패했습니다.";
      Alert.alert("회원가입 실패", message);
    },
  });
}

export default useSignUp;
