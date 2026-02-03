import { colors } from "@/constants";
import useAuth from "@/hooks/useAuth";
import { useNavigationContext } from "@/providers/NavigationProvider";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function renderHeader() {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => router.back()}
        style={styles.backBtn}
        hitSlop={12}
      >
        <Ionicons name="chevron-back" size={28} color="#111" />
      </Pressable>
      <Text style={styles.headerTitle}>마이페이지</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

export default function MyPageScreen() {
  const { userInfoQuery } = useAuth();
  const { data: userInfo, isLoading, error, refetch, isRefetching } = userInfoQuery;
  const { isOnboardingCompleted, setOnboardingCompleted } = useNavigationContext();

  // 401 또는 서버 500(토큰 만료 메시지) → 로그인하러 가기
  const status = (error as any)?.response?.status;
  const msg = String(
    (error as any)?.response?.data?.message ??
      (error as any)?.response?.data?.detail ??
      ""
  );
  const isUnauthorized =
    error &&
    (status === 401 || (status === 500 && /토큰|token|expired|만료/i.test(msg)));

  // 로딩 중
  if (isLoading && !userInfo) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.BLACK} />
          <Pressable
            style={[styles.loginBtnSecondary, { marginTop: 24 }]}
            onPress={() => router.replace("/auth")}
          >
            <Text style={styles.loginBtnSecondaryText}>로그인하러 가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // 로그인 안 됨 (401) → 로그인하러 가기
  if (isUnauthorized) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loginPromptContainer}>
          <Ionicons name="person-outline" size={64} color={colors.INACTIVE} />
          <Text style={styles.loginPromptText}>
            로그인이 필요해요. 로그인해 주세요.
          </Text>
          <Pressable
            style={styles.loginBtn}
            onPress={() => router.replace("/auth")}
          >
            <Text style={styles.loginBtnText}>로그인하러 가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // 정보가 안 받아와짐 (네트워크/기타 에러) → 새로고침 + 로그인하러 가기
  if (error && !userInfo) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loginPromptContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color={colors.INACTIVE} />
          <Text style={styles.loginPromptText}>
            데이터를 불러오지 못했어요.
          </Text>
          <View style={styles.loginPromptActions}>
            <Pressable
              style={styles.loginBtn}
              onPress={() => refetch()}
              disabled={isRefetching}
            >
              <Text style={styles.loginBtnText}>
                {isRefetching ? "불러오는 중…" : "다시 시도"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.loginBtnSecondary}
              onPress={() => router.replace("/auth")}
            >
              <Text style={styles.loginBtnSecondaryText}>로그인하러 가기</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 조회 성공 → 유저 정보 표시
  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={styles.content}>
        {/* 프로필 아이콘 */}
        <View style={styles.profileIcon}>
          <Ionicons name="person" size={48} color={colors.BLACK} />
        </View>

        {/* 유저 정보 */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>닉네임</Text>
            <Text style={styles.infoValue}>{userInfo?.nickname || "-"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>이메일</Text>
            <Text style={styles.infoValue}>{userInfo?.email || "-"}</Text>
          </View>

          {userInfo?.name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>이름</Text>
              <Text style={styles.infoValue}>{userInfo.name}</Text>
            </View>
          )}

          {userInfo?.birth && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>생년월일</Text>
              <Text style={styles.infoValue}>{userInfo.birth}</Text>
            </View>
          )}

          {userInfo?.phone_num && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>전화번호</Text>
              <Text style={styles.infoValue}>{userInfo.phone_num}</Text>
            </View>
          )}

          {/* 임시: 온보딩 다시 보기 on/off */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>온보딩 다시 보기 (임시)</Text>
            <Switch
              value={!isOnboardingCompleted}
              onValueChange={async (on) => {
                if (on) {
                  await AsyncStorage.setItem("onboarding_completed", "false");
                  setOnboardingCompleted(false);
                  router.replace("/(onboarding)");
                } else {
                  await AsyncStorage.setItem("onboarding_completed", "true");
                  setOnboardingCompleted(true);
                }
              }}
              trackColor={{ false: "#e0e0e0", true: "#111" }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.BLACK,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.GRAY_200,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 32,
  },
  infoSection: {
    gap: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.INACTIVE,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.BLACK,
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 20,
  },
  loginPromptActions: {
    width: "100%",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  loginBtnSecondary: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  loginBtnSecondaryText: {
    color: colors.BLACK,
    fontWeight: "700",
    fontSize: 15,
  },
  loginPromptText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.INACTIVE,
    textAlign: "center",
  },
  loginBtn: {
    marginTop: 8,
    backgroundColor: colors.BLACK,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: "center",
  },
  loginBtnText: {
    color: colors.WHITE,
    fontWeight: "800",
    fontSize: 15,
  },
  clearTokenBtn: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  clearTokenText: {
    fontSize: 12,
    color: colors.INACTIVE,
    fontWeight: "500",
  },
});
