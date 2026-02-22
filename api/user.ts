import {
  ChangeNicknameForm,
  FindEmailForm,
  FindPasswordForm,
  InfoResponse,
  ResetPasswordForm,
  SignUpForm,
  UpdateUserInfoForm,
} from "@/types";
import axiosInstance, { PREFIX } from "./axios";

/** 회원가입 */
async function signup(body: SignUpForm): Promise<void> {
  const { data } = await axiosInstance.post(`${PREFIX}/users/sign-up`, body);

  return data;
}

/** 이메일 찾기 */
async function findEmail(body: FindEmailForm): Promise<{ email: string }> {
  const { data } = await axiosInstance.post<{ email: string }>(
    `${PREFIX}/users/find-email`,
    body,
  );

  return data;
}

/** 로그인 상태에서 비밀번호 변경 */
async function findInLoginPassword(body: FindPasswordForm): Promise<void> {
  const { data } = await axiosInstance.patch(`${PREFIX}/users/change-pw`, body);
  return data;
}

/** 비밀번호 찾기 */
async function findPassword(body: ResetPasswordForm): Promise<void> {
  const { data } = await axiosInstance.post(`${PREFIX}/users/reset-pw`, body);

  return data;
}
/** 유저 정보 수정 (이름, 생년월일, 전화번호 등) (현재 API가 없음) */
async function updateUserInfo(body: UpdateUserInfoForm): Promise<void> {
  const { data } = await axiosInstance.patch(`${PREFIX}/users/info`, body);
  return data;
}

/** 유저 정보 받아오기 */
async function getUserInfo(): Promise<InfoResponse> {
  const { data } = await axiosInstance.get<InfoResponse>(
    `${PREFIX}/users/info`,
  );

  return data;
}

/** 닉네임 변경 */
async function changeNickname(body: ChangeNicknameForm): Promise<void> {
  const { data } = await axiosInstance.patch(`${PREFIX}/users/nickname`, body);

  return data;
}

export {
  changeNickname,
  findEmail,
  findInLoginPassword,
  findPassword,
  getUserInfo,
  signup,
  updateUserInfo
};

