import { findInLoginPassword } from "@/api/auth";
import queryClient from "@/api/queryClient";
import { queryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

function useFindInLoginPassword() {
  return useMutation({
    mutationFn: findInLoginPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey.AUTH] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "비밀번호 변경에 실패했습니다.";
      Alert.alert("오류", message);
    },
  });
}

export default useFindInLoginPassword;
