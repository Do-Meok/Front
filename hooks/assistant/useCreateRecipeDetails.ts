import { createRecipeDetails } from "@/api/assistants";
import queryClient from "@/api/queryClient";
import { queryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

function useCreateRecipeDetails() {
  return useMutation({
    mutationFn: createRecipeDetails,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey.ASSISTANT] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "상세 조리법 생성에 실패했습니다.";
      Alert.alert("오류", errorMessage);
    },
  });
}

export default useCreateRecipeDetails;
