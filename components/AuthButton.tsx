import { colors } from "@/constants";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, Text } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function AuthButton() {
  const onPressCommon = () => {
    router.push("/auth/login");
  };

  const onPressKakao = () => {
    router.push("/auth/kakao-webview");
  };

  return (
    <>
      <Pressable style={styles.kakaoBtn} onPress={onPressKakao}>
        <Text style={styles.kakaoBtnText}>카카오로 로그인</Text>
      </Pressable>

      <Pressable style={styles.secondaryBtn} onPress={onPressCommon}>
        <Text style={styles.secondaryBtnText}>일반 로그인으로 시작하기</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  socialBtn: {
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  kakao: {
    backgroundColor: "#FEE500",
  },
  disabled: {
    opacity: 0.7,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.BLACK,
  },
  secondaryBtn: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    backgroundColor: colors.WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.BLACK,
  },
  kakaoBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: "#FEE500",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  kakaoBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000CC",
  },
});
