import { signup } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

function useSignUp() {
  return useMutation({
    mutationFn: signup,
    onSuccess: () => router.replace("/auth"),
  });
}

function useAuth() {
  const signupMutation = useSignUp();

  return {
    signupMutation,
  };
}

export default useAuth;
