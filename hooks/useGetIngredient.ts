import { getIngredient } from "@/api/ingredients";
import { useQuery } from "@tanstack/react-query";

function useGetIngredient(ingredientId: number) {
  return useQuery({
    queryFn: () => getIngredient(ingredientId),
    queryKey: ["ingredients", "detail", ingredientId],
    enabled: !!ingredientId,
  });
}

export default useGetIngredient;