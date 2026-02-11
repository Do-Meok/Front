import { findEmail } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

function useFindEmail() {
  return useMutation({
    mutationFn: findEmail,
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "이메일 찾기에 실패했습니다.";
      Alert.alert("오류", message);
    },
  });
}

export default useFindEmail;
