import queryClient from "@/api/queryClient";
import { updateUserInfo } from "@/api/user";
import { queryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";

function useUpdateUserInfo() {
    return useMutation({
        mutationFn: updateUserInfo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey.AUTH] });
        },
    });
}

export default useUpdateUserInfo;
