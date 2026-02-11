import { refreshToken } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";

function useRefreshToken() {
  return useMutation({
    mutationFn: refreshToken,
  });
}

export default useRefreshToken;
