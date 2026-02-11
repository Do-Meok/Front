import { API_URL, PREFIX } from "@/api/axios";
import { colors } from "@/constants";
import { setGuestChosen } from "@/utils/guestMode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const GUEST_STORAGE_KEY = "is_guest";
const KAKAO_LOGIN_URL = `${API_URL}${PREFIX}/users/kakao`;

export default function AuthButton() {
  const onPressKakao = () => {
    Linking.openURL(KAKAO_LOGIN_URL);
  };

  const onPressCommon = () => {
    // 일반 로그인 화면으로 이동 (로그인 폼 표시)
    router.push("/auth/login");
  };

  const onPressGuest = async () => {
    // 동기 플래그 먼저 설정 → 네비 가드가 탭에서 바로 튕기지 않도록
    setGuestChosen();
    await AsyncStorage.setItem(GUEST_STORAGE_KEY, "true");
    router.replace("/(tabs)");
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

      <Pressable style={styles.ghostBtn} onPress={onPressGuest}>
        <Text style={styles.ghostBtnText}>로그인 없이 시작</Text>
      </Pressable>

      <View style={styles.footerLinks}>
        <Pressable onPress={() => router.push("/auth/find-email")}>
          <Text style={styles.footerLinkText}>이메일 찾기</Text>
        </Pressable>
        <Text style={styles.footerDivider}>|</Text>
        <Pressable onPress={() => router.push("/auth/find-password")}>
          <Text style={styles.footerLinkText}>비밀번호 찾기</Text>
        </Pressable>
      </View>
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

  ghostBtn: {
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.GRAY_700 ?? colors.GRAY,
    textDecorationLine: "underline",
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  footerLinkText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.GRAY_700 ?? colors.GRAY,
  },
  footerDivider: {
    fontSize: 12,
    color: colors.INACTIVE,
  },
});
