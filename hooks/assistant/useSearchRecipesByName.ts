import { searchRecipesByName } from "@/api/recipes";
import { queryKey } from "@/constants";
import { useQuery } from "@tanstack/react-query";

function useSearchRecipesByName(name: string) {
  return useQuery({
    queryFn: () => searchRecipesByName(name),
    queryKey: [queryKey.ASSISTANT, queryKey.SEARCH_RECIPES_BY_NAME, name],
    enabled: !!name,
  });
}

export default useSearchRecipesByName;
