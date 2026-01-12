import { updateIngredient } from "@/api/ingredients";
import queryClient from "@/api/queryClient";
import { UpdateIngredientRequest } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

function useUpdateIngredient() {
  return useMutation({
    mutationFn: ({
      ingredientId,
      data,
    }: {
      ingredientId: number;
      data: UpdateIngredientRequest;
    }) => updateIngredient(ingredientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      Alert.alert("성공", "식재료가 수정되었습니다.");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "식재료 수정에 실패했습니다.";
      Alert.alert("오류", errorMessage);
    },
  });
}

export default useUpdateIngredient;