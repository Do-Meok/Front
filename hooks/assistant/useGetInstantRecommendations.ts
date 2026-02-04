import { getInstantRecommendations } from "@/api/assistants";
import { queryKey } from "@/constants";
import { useQuery } from "@tanstack/react-query";

function useGetInstantRecommendations(ingredients: string[]) {
  return useQuery({
    queryFn: () => getInstantRecommendations(ingredients),
    queryKey: [queryKey.ASSISTANT, queryKey.GET_INSTANT_RECOMMENDATIONS, ingredients],
    enabled: ingredients.length > 0,
  });
}

export default useGetInstantRecommendations;
