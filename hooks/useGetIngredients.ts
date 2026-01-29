import { getIngredients } from "@/api/ingredients";
import { queryKey } from "@/constants";
import { useQuery } from "@tanstack/react-query";

function useGetIngredients() {
  return useQuery({
    queryFn: () => getIngredients(),
    queryKey: [queryKey.INGREDIENTS],
  });
}

export default useGetIngredients;