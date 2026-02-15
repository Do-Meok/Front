import { API_URL, PREFIX } from "@/api/axios";
import { colors } from "@/constants";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

const KAKAO_LOGIN_URL = `${API_URL}${PREFIX}/users/kakao`;

export default function AuthButton() {
  const onPressKakao = () => {
    Linking.openURL(KAKAO_LOGIN_URL);
  };

  const onPressCommon = () => {
    // 일반 로그인 화면으로 이동 (로그인 폼 표시)
    router.push("/auth/login");
  };

  return (
    <>
      <Pressable
        style={[styles.socialBtn, styles.kakao]}
        onPress={onPressKakao}
      >
        <Text style={styles.socialBtnText}>카카오로 시작하기</Text>
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
});
