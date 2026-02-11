import { logout } from "@/api/auth";
import queryClient from "@/api/queryClient";
import { queryKey } from "@/constants";
import { useMutation } from "@tanstack/react-query";

function useLogout() {
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey.AUTH] });
    },
  });
}

export default useLogout;
