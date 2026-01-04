import { colors } from "@/constants";
import React, { ReactNode, forwardRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  rightChild?: ReactNode;
}

const InputField = forwardRef<TextInput, InputFieldProps>(function InputField(
  { error = "", rightChild = null, style, ...props },
  ref,
) {
  const hasError = Boolean(error);

  return (
    <View>
      <View
        style={[
          styles.container,
          props.multiline && styles.multiLine,
          hasError && styles.containerError,
        ]}
      >
        <TextInput
          ref={ref}
          placeholderTextColor={colors.GRAY}
          style={[styles.input, style]}
          autoCapitalize="none"
          spellCheck={false}
          autoCorrect={false}
          {...props}
        />
        {rightChild}
      </View>

      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    color: colors.GRAY_700,
    marginBottom: 6,
  },

  // ✅ 기본(평범)
  container: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.GRAY_200 ?? "#ddd",
    backgroundColor: colors.WHITE,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    paddingHorizontal: 0,
    color: colors.BLACK,
  },

  containerError: {
    borderColor: colors.RED_500 ?? "#ff4d4f",
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: colors.RED_500 ?? "#ff4d4f",
  },

  multiLine: {
    height: 120,
    alignItems: "flex-start",
    paddingVertical: 10,
  },
});

export default InputField;
