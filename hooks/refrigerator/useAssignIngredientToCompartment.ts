import queryClient from "@/api/queryClient";
import { assignIngredientToCompartment } from "@/api/refrigerator";
import { queryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";

function useAssignIngredientToCompartment() {
  return useMutation({
    mutationFn: ({
      compartmentId,
      ingredientId,
    }: {
      compartmentId: number;
      ingredientId: number;
    }) => assignIngredientToCompartment(compartmentId, ingredientId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [queryKey.COMPARTMENT_INGREDIENTS, variables.compartmentId],
      });
    },
  });
}

export default useAssignIngredientToCompartment;
