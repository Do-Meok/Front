import { signup } from "@/api/user";
import { useMutation } from "@tanstack/react-query";

function useSignUp() {
  return useMutation({
    mutationFn: signup,
  });
}

export default useSignUp;
