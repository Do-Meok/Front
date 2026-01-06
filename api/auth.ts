import { LoginForm, SignUpForm } from "@/types";
import axiosInstance, { PREFIX } from "./axios";

async function signup(body: SignUpForm): Promise<void> {
  const { data } = await axiosInstance.post(`${PREFIX}/users/sign-up`, body);

  return data;
}

async function login(body: LoginForm): Promise<{ accessToken: string }> {
  const { data } = await axiosInstance.post(`${PREFIX}/users/log-in`, body);

  return data;
}

export { login, signup };

