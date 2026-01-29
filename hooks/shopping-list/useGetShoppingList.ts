import { getShoppingList } from "@/api/shopping";
import { queryKey } from "@/constants";
import { useQuery } from "@tanstack/react-query";

function useGetShoppingList(){
    return useQuery({
        queryFn: ()=> getShoppingList(),
        queryKey: [queryKey.SHOPPING, queryKey.GET_SHOPPING]
    });
}

export default useGetShoppingList;