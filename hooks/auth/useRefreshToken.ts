import { refreshToken } from "@/api/auth";
import axiosInstance from "@/api/axios";
import queryClient from "@/api/queryClient";
import { queryKey } from "@/constants";
import { saveSecureStore } from "@/utils/secureStore";
import { useMutation } from "@tanstack/react-query";

function useRefreshToken() {
  return useMutation({
    mutationFn: refreshToken,
    onSuccess: async (data) => {
      if (data?.access_token) {
        await saveSecureStore("accessToken", data.access_token);
        if (data?.refresh_token) {
          await saveSecureStore("refreshToken", data.refresh_token);
        }
        axiosInstance.defaults.headers.common["Authorization"] =
          `Bearer ${data.access_token}`;
        queryClient.invalidateQueries({ queryKey: [queryKey.AUTH] });
      }
    },
  });
}

export default useRefreshToken;
