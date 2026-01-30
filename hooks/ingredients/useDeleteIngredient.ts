import { deleteIngredient } from "@/api/ingredients";
import queryClient from "@/api/queryClient";
import { queryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

function useDeleteIngredient() {
  return useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey.INGREDIENTS] });
      Alert.alert("성공", "식재료가 삭제되었습니다.");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "식재료 삭제에 실패했습니다.";
      Alert.alert("오류", errorMessage);
    },
  });
}

export default useDeleteIngredient;