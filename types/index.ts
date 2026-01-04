export type RegisterFormValues = {
  email: string;
  password: string;
  checked_password: string;
  nickname: string;
};

export type SignUpForm = {
  email: string; //"user@example.com",
  password: string;
  checked_password: string;
  nickname: string;
  name: string | null;
  birth: string | null; //"2026-01-04",
  phone_num: string | null;
};

export type LoginForm = {
  email: string;
  password: string;
};
