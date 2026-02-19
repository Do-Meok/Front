import { updateUserInfo } from "@/api/auth";
import queryClient from "@/api/queryClient";
import { queryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

function useUpdateUserInfo() {
    return useMutation({
        mutationFn: updateUserInfo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey.AUTH] });
            Alert.alert("성공", "정보가 수정되었습니다.");
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.message || "정보 수정에 실패했습니다.";
            Alert.alert("오류", message);
        },
    });
}

export default useUpdateUserInfo;
