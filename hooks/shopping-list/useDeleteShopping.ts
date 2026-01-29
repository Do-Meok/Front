import queryClient from "@/api/queryClient";
import { deleteShoppingList } from "@/api/shopping";
import { queryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";

function useDeleteShopping(){
    return useMutation({
        mutationFn: deleteShoppingList,
        onSuccess: () => {
            queryClient.invalidateQueries({ 
                queryKey: [queryKey.SHOPPING, queryKey.GET_SHOPPING]
            })
        }
    });
}

export default useDeleteShopping;