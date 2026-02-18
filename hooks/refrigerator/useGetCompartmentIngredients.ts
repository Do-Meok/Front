import { getCompartmentIngredients } from "@/api/refrigerator";
import { queryKey } from "@/constants";
import { useQuery } from "@tanstack/react-query";

function useGetCompartmentIngredients(compartmentId: number | null) {
    return useQuery({
        queryFn: () => getCompartmentIngredients(compartmentId!),
        queryKey: [queryKey.COMPARTMENT_INGREDIENTS, compartmentId],
        enabled: compartmentId !== null,
    });
}

export default useGetCompartmentIngredients;
