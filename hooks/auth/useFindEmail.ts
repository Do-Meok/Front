import { findEmail } from "@/api/user";
import { useMutation } from "@tanstack/react-query";

function useFindEmail() {
  return useMutation({
    mutationFn: findEmail,
  });
}

export default useFindEmail;
