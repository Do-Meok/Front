import queryClient from "@/api/queryClient";
import { addRefrigerator } from "@/api/refrigerator";
import { queryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

function useAddRefrigerator() {
    return useMutation({
        mutationFn: addRefrigerator,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [queryKey.REFRIGERATOR],
            });
        },
        onError: (error: any) => {
            Alert.alert("오류", error?.response?.data?.message);
        }
    })
}

export default useAddRefrigerator;