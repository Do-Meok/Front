import queryClient from "@/api/queryClient";
import { findInLoginPassword } from "@/api/user";
import { queryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";

function useFindInLoginPassword() {
  return useMutation({
    mutationFn: findInLoginPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey.AUTH] });
    },
  });
}

export default useFindInLoginPassword;
