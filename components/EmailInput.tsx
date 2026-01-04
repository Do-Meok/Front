import type { RegisterFormValues } from "@/types";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import InputField from "./InputField";

function EmailInput() {
  const { control, setFocus } = useFormContext<RegisterFormValues>();

  return (
    <Controller
      name="email"
      control={control}
      rules={{
        validate: (data: string) => {
          const v = (data ?? "").trim();
          if (v.length === 0) return "이메일을 입력해주세요.";
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
            return "올바른 이메일 형식이 아닙니다.";
          }
          return true;
        },
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <InputField
          autoFocus
          placeholder="이메일을 입력해주세요."
          inputMode="email"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => setFocus("password")}
          value={value}
          onChangeText={onChange}
          error={error?.message}
        />
      )}
    />
  );
}

export default EmailInput;
