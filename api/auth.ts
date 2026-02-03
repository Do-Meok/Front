import { clearStoredTokens } from "./authRefresh";
import { InfoResponse, LoginForm, SignUpForm } from "@/types";
import axiosInstance, { PREFIX } from "./axios";

async function signup(body: SignUpForm): Promise<void> {
  const { data } = await axiosInstance.post(`${PREFIX}/users/sign-up`, body);

  return data;
}

async function login(body: LoginForm): Promise<any> {
  const { data } = await axiosInstance.post(`${PREFIX}/users/log-in`, body);

  return data;
}

async function getUserInfo(): Promise<InfoResponse> {
  const { data } = await axiosInstance.get<InfoResponse>(
    `${PREFIX}/users/info`
  );
  return data;
}

/** 로그아웃: 저장된 토큰 삭제 + axios 헤더 제거 */
async function logout(): Promise<void> {
  await clearStoredTokens();
  delete axiosInstance.defaults.headers.common["Authorization"];
}

export { login, signup, getUserInfo, logout };

