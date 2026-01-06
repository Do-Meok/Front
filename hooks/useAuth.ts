import { login, signup } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

function useSignUp() {
  return useMutation({
    mutationFn: signup,
    onSuccess: () => router.replace("/auth"),
  });
}

function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: () => router.replace("/(tabs)"),
  });
}

function useAuth() {
  const signupMutation = useSignUp();
  const loginMutation = useLogin();

  return {
    signupMutation,
    loginMutation,
  };
}

export default useAuth;
