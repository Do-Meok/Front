import { getRecipes } from "@/api/recipes";
import { queryKey } from "@/constants";
import { useQuery } from "@tanstack/react-query";

function useGetRecipes() {
    return useQuery({
        queryFn: () => getRecipes(),
        queryKey: [queryKey.RECIPES, queryKey.GET_RECIPES],
    });
}

export default useGetRecipes;