import { colors } from "@/constants";
import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text } from "react-native";

export default function AuthButton() {
  const onPressKakao = () => {
    // 실제 카카오 로그인 붙이기 전까지는 임시로 auth 이동
    Alert.alert("카카오 로그인 준비 중");
  };

  const onPressCommon = () => {
    router.replace("/auth");
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
