import type { RegisterFormValues } from "@/types";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import InputField from "./InputField";

function NicknameInput() {
  const { control } = useFormContext<RegisterFormValues>();

  return (
    <Controller
      name="nickname"
      control={control}
      rules={{
        validate: (data: string) => {
          const v = (data ?? "").trim();
          if (v.length === 0) return "닉네임을 입력해주세요.";
          if (v.length < 2) return "닉네임은 2자 이상이어야 합니다.";
          if (v.length > 12) return "닉네임은 12자 이내로 입력해주세요.";
          return true;
        },
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <InputField
          placeholder="닉네임을 입력해주세요."
          inputMode="text"
          returnKeyType="done"
          submitBehavior="submit"
          value={value}
          onChangeText={onChange}
          error={error?.message}
        />
      )}
    />
  );
}

export default NicknameInput;
