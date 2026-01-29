import queryClient from "@/api/queryClient";
import { addShoppingList } from "@/api/shopping";
import { queryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

function useCreateShopping() {
  return useMutation({
    mutationFn: addShoppingList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey.SHOPPING] });
      Alert.alert("성공", "장보기 목록에 추가되었습니다.");
    },
  });
}

export default useCreateShopping;