import { addIngredient } from "@/api/ingredients";
import queryClient from "@/api/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

function useCreateIngredient() {
  return useMutation({
    mutationFn: addIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      Alert.alert("성공", "식재료가 추가되었습니다.");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "식재료 추가에 실패했습니다.";
      Alert.alert("오류", errorMessage);
    },
  });
}

export default useCreateIngredient;