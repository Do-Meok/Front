import {
  ChangeNicknameForm,
  FindEmailForm,
  FindPasswordForm,
  InfoResponse,
  LoginForm,
  ResetPasswordForm,
  SignUpForm,
  TokenRefreshResponse,
} from "@/types";
import { getSecureStore } from "@/utils/secureStore";
import { clearStoredTokens } from "./authRefresh";
import axiosInstance, { PREFIX } from "./axios";

// 유저 정보 get
async function getUserInfo(): Promise<InfoResponse> {
  const { data } = await axiosInstance.get<InfoResponse>(
    `${PREFIX}/users/info`
  );

  return data;
}

// 회원가입
async function signup(body: SignUpForm): Promise<void> {
  const { data } = await axiosInstance.post(`${PREFIX}/users/sign-up`, body);

  return data;
}

// 로그인
async function login(body: LoginForm): Promise<TokenRefreshResponse> {
  const { data } = await axiosInstance.post<TokenRefreshResponse>(
    `${PREFIX}/users/log-in`,
    body
  );

  return data;
}

// 카카오 로그인
async function kakaoLogin(): Promise<void> {
  const { data } = await axiosInstance.get(`${PREFIX}/users/kakao`);

  return data;
}

// 카카오 로그인 콜백
async function kakaoLoginCallback(): Promise<void> {
  const { data } = await axiosInstance.get(`${PREFIX}/users/kakao/redirect`);

  return data;
}

/** 로그아웃: 서버에 refresh_token 전달 후 저장된 토큰 삭제 + axios 헤더 제거 */
async function logout(): Promise<void> {
  const refreshToken = await getSecureStore("refreshToken");
  try {
    await axiosInstance.post(`${PREFIX}/users/log-out`, {
      refresh_token: refreshToken ?? undefined,
    });
  } catch {
    // 422 등 API 실패해도 클라이언트에서는 항상 로그아웃 처리
  }
  await clearStoredTokens();
  delete axiosInstance.defaults.headers.common["Authorization"];
}

/** 토큰 재발급 */
async function refreshToken(): Promise<TokenRefreshResponse> {
  const storedRefresh = await getSecureStore("refreshToken");
  const { data } = await axiosInstance.post<TokenRefreshResponse>(
    `${PREFIX}/users/refresh`,
    { refresh_token: storedRefresh }
  );

  return data;
}

/** 이메일 찾기 */
async function findEmail(body: FindEmailForm): Promise<void> {
  const { data } = await axiosInstance.post(`${PREFIX}/users/find-email`, body);
  
  return data;
}

/** (로그인 상태) 비밀번호 찾기 */
async function findInLoginPassword(body: FindPasswordForm): Promise<void> {
  const { data } = await axiosInstance.patch(`${PREFIX}/users/find-password`, body);
  return data;
}

/** 비밀번호 찾기 */
async function findPassword(body: ResetPasswordForm): Promise<void> {
  const { data } = await axiosInstance.post(`${PREFIX}/users/reset-pw`, body);
  
  return data;
}

/** 닉네임 변경 */
async function changeNickname(body: ChangeNicknameForm): Promise<void> {
  const { data } = await axiosInstance.patch(`${PREFIX}/users/nickname`, body);
  
  return data;
}

export {
  changeNickname, findEmail,
  findInLoginPassword,
  findPassword,
  getUserInfo,
  login,
  logout,
  refreshToken,
  signup
};

