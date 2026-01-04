import { colors } from "@/constants";
import type { RegisterFormValues } from "@/types";
import React, { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Pressable, StyleSheet, Text } from "react-native";
import InputField from "./InputField";

function CheckPasswordInput() {
  const {
    control,
    setFocus,
    watch,
    getValues,
    trigger,
    formState: { touchedFields },
  } = useFormContext<RegisterFormValues>();
  const password = watch("password");
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  useEffect(() => {
    // ✅ 확인칸을 한번이라도 건드린 이후에만 재검증
    if (touchedFields.checked_password) {
      void trigger("checked_password");
    }
  }, [password, touchedFields.checked_password, trigger]);

  return (
    <Controller
      name="checked_password"
      control={control}
      rules={{
        validate: (data: string) => {
          const confirmPassword = (data ?? "").trim();
          const currentPassword = (getValues("password") ?? "").trim();
          if (confirmPassword.length === 0)
            return "비밀번호 확인을 입력해주세요.";
          if (confirmPassword !== currentPassword)
            return "비밀번호가 일치하지 않습니다.";
          return true;
        },
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <InputField
          placeholder="비밀번호 확인을 입력해주세요."
          secureTextEntry={!isPasswordVisible}
          inputMode="text"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => setFocus("nickname")}
          value={value}
          onChangeText={onChange}
          error={error?.message}
          rightChild={
            <Pressable
              hitSlop={8}
              style={styles.toggleButton}
              onPress={() => setIsPasswordVisible((prev) => !prev)}
            >
              <Text style={styles.toggleText}>
                {isPasswordVisible ? "숨김" : "보기"}
              </Text>
            </Pressable>
          }
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.GRAY,
  },
});

export default CheckPasswordInput;
