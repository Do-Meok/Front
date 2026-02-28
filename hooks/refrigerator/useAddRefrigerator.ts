import queryClient from "@/api/queryClient";
import { addRefrigerator } from "@/api/refrigerator";
import { queryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

function useAddRefrigerator() {
  return useMutation({
    mutationFn: addRefrigerator,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKey.REFRIGERATOR],
      });
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((e: any) => e.msg).join("\n")
        : detail ?? error?.response?.data?.message ?? "알 수 없는 오류가 발생했습니다.";
      Alert.alert("냉장고 추가 실패", message);
    },
  });
}

export default useAddRefrigerator;
