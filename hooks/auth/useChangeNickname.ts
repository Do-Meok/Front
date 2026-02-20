import queryClient from "@/api/queryClient";
import { changeNickname } from "@/api/user";
import { queryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

function useChangeNickname() {
  return useMutation({
    mutationFn: changeNickname,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey.AUTH] });
      Alert.alert("성공", "닉네임이 변경되었습니다.");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "닉네임 변경에 실패했습니다.";
      Alert.alert("오류", message);
    },
  });
}

export default useChangeNickname;
