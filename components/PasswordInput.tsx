import { colors } from "@/constants";
import type { RegisterFormValues } from "@/types";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Pressable, StyleSheet, Text } from "react-native";
import InputField from "./InputField";

function PasswordInput() {
  const { control, setFocus } = useFormContext<RegisterFormValues>();
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  return (
    <Controller
      name="password"
      control={control}
      rules={{
        validate: (data: string) => {
          const v = (data ?? "") as string;
          if (v.length === 0) return "비밀번호를 입력해주세요.";
          if (v.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
          // 추가 정책이 생기면 여기에서 확장
          return true;
        },
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <InputField
          placeholder="비밀번호를 입력해주세요."
          secureTextEntry={!isPasswordVisible}
          inputMode="text"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => setFocus("check_password")}
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

export default PasswordInput;
