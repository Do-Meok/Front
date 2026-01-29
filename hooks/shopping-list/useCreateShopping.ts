import queryClient from "@/api/queryClient";
import { addShoppingList } from "@/api/shopping";
import { queryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

function useCreateShopping() {
  return useMutation({
    mutationFn: addShoppingList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey.SHOPPING, queryKey.GET_SHOPPING] });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const data = error?.response?.data;

      let message = "장보기 목록 추가에 실패했습니다.";

      if (status === 422) {
        const detail = data?.detail;
        if (Array.isArray(detail) && detail.length > 0) {
          const messages = detail.map((d: { msg?: string }) => d?.msg).filter(Boolean);
          message = messages.length > 0 ? messages.join("\n") : message;
        } else if (typeof detail === "string") {
          message = detail;
        }
      } else if (data?.detail) {
        message = typeof data.detail === "string" ? data.detail : message;
      }

      Alert.alert("오류", message);
    },
  });
}

export default useCreateShopping;