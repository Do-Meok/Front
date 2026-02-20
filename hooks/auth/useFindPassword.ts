import { findPassword } from "@/api/user";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

function useFindPassword() {
  return useMutation({
    mutationFn: findPassword,
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "비밀번호 재설정에 실패했습니다.";
      Alert.alert("오류", message);
    },
  });
}

export default useFindPassword;
