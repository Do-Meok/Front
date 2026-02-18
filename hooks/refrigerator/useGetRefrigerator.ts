import { getRefrigerator } from "@/api/refrigerator";
import { queryKey } from "@/constants";
import { useQuery } from "@tanstack/react-query";

function useGetRefrigerator(refrigeratorId: number | null) {
    return useQuery({
        queryFn: () => getRefrigerator(refrigeratorId!),
        queryKey: [queryKey.REFRIGERATOR, refrigeratorId],
        enabled: refrigeratorId !== null,
    });
}

export default useGetRefrigerator;
