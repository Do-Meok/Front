import queryClient from "@/api/queryClient";
import { deleteRecipe } from "@/api/recipes";
import { queryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

function useDeleteRecipe() {
  return useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey.RECIPES] });
      Alert.alert("성공", "레시피가 삭제되었습니다.");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "레시피 삭제에 실패했습니다.";
      Alert.alert("오류", errorMessage);
    },
  });
}

export default useDeleteRecipe;
