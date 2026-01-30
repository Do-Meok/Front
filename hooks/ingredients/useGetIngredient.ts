import { getIngredient } from "@/api/ingredients";
import { queryKey } from "@/constants";
import { useQuery } from "@tanstack/react-query";

function useGetIngredient(ingredientId: number) {
  return useQuery({
    queryFn: () => getIngredient(ingredientId),
    queryKey: [queryKey.INGREDIENTS, "detail", ingredientId],
    enabled: !!ingredientId,
  });
}

export default useGetIngredient;