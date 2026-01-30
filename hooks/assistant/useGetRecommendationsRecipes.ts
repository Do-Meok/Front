import { getRecommendationsRecipes } from "@/api/recipes";
import { queryKey } from "@/constants";
import { useQuery } from "@tanstack/react-query";

function useGetRecommendationsRecipes() {
  return useQuery({
    queryFn: () => getRecommendationsRecipes(),
    queryKey: [queryKey.ASSISTANT, queryKey.GET_RECOMMENDATIONS_RECIPES],
  });
}

export default useGetRecommendationsRecipes;
