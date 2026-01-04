import { SignUpForm } from "@/types";
import axiosInstance, { PREFIX } from "./axios";

async function signup(body: SignUpForm): Promise<void> {
  const { data } = await axiosInstance.post(`${PREFIX}/users/sign-up`, body);

  return data;
}

export { signup };

