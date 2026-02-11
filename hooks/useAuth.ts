import useGetUserInfo from "@/hooks/auth/useGetUserInfo";
import useLogin from "@/hooks/auth/useLogin";
import useSignUp from "@/hooks/auth/useSignUp";
import { useNavigationContext } from "@/providers/NavigationProvider";

function useAuth() {
  const { hasToken } = useNavigationContext();
  const signupMutation = useSignUp();
  const loginMutation = useLogin();
  const userInfoQuery = useGetUserInfo(hasToken === true);

  return {
    signupMutation,
    loginMutation,
    userInfoQuery,
  };
}

export default useAuth;
