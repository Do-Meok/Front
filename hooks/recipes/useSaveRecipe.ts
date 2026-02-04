import queryClient from "@/api/queryClient";
import { saveRecipe } from "@/api/recipes";
import { queryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

function useSaveRecipe() {
    return useMutation({
        mutationFn: saveRecipe,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey.RECIPES] });
        },
        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                "레시피 저장에 실패했습니다.";
            Alert.alert("오류", errorMessage);
        },
    });
}

export default useSaveRecipe;