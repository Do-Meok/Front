import queryClient from "@/api/queryClient";
import { deleteRefrigerator } from "@/api/refrigerator";
import { queryKey } from "@/constants";
import { useFridgeContext } from "@/providers/FridgeProvider";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

function useDeleteRefrigerator() {
  const { removeFridge } = useFridgeContext();
  return useMutation({
    mutationFn: (refrigeratorId: number) => deleteRefrigerator(refrigeratorId),
    onSuccess: (_data, refrigeratorId) => {
      removeFridge(refrigeratorId);
      queryClient.invalidateQueries({ queryKey: [queryKey.REFRIGERATOR] });
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((e: any) => e.msg).join("\n")
        : detail ?? error?.response?.data?.message ?? "냉장고를 삭제하지 못했습니다.";
      Alert.alert("삭제 실패", message);
    },
  });
}

export default useDeleteRefrigerator;
