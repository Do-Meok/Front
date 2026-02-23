import { autoFillIngredient } from "@/api/ingredients";
import queryClient from "@/api/queryClient";
import { queryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";

function useAutoFillIngredient() {
  return useMutation({
    mutationFn: (ingredientId: number) => autoFillIngredient(ingredientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey.INGREDIENTS] });
    },
  });
}

export default useAutoFillIngredient;
