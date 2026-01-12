import { getIngredients } from "@/api/ingredients";
import { useQuery } from "@tanstack/react-query";

function useGetIngredients() {
  return useQuery({
    queryFn: () => getIngredients(),
    queryKey: ["ingredients"],
  });
}

export default useGetIngredients;