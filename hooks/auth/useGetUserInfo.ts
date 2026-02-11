import { getUserInfo } from "@/api/auth";
import { queryKey } from "@/constants";
import { useQuery } from "@tanstack/react-query";

function isTokenOrUnauthorizedError(error: any): boolean {
  const status = error?.response?.status;
  if (status === 401) return true;
  if (status === 500) {
    const msg = String(
      error?.response?.data?.message ?? error?.response?.data?.detail ?? ""
    );
    return /토큰|token|expired|만료/i.test(msg);
  }
  return false;
}

function useGetUserInfo(enabled: boolean) {
  return useQuery({
    queryKey: [queryKey.AUTH, queryKey.GET_ME],
    queryFn: getUserInfo,
    enabled,
    retry: (_, error: any) => !isTokenOrUnauthorizedError(error),
  });
}

export default useGetUserInfo;
