import SettingItem from "@/components/SettingItem";
import { colors } from "@/constants";
import useRefreshToken from "@/hooks/auth/useRefreshToken";
import useAuth from "@/hooks/useAuth";
import { useNavigationContext } from "@/providers/NavigationProvider";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
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
  const refreshTokenMutation = useRefreshToken();

  const missingInfo = userInfo && (!userInfo.name || !userInfo.birth || !userInfo.phone_num);


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
            onPress={() => router.replace("/auth/logout-loading")}
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
            onPress={() => router.replace("/auth/logout-loading")}
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
              onPress={() => router.replace("/auth/logout-loading")}
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

      {/* 스크롤 가능한 본문 */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 아이콘 */}
        <View style={styles.profileIcon}>
          <Ionicons name="person" size={48} color={colors.BLACK} />
        </View>

        {/* 유저 정보 */}
        {missingInfo && (
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View>
                <Text style={styles.infoLabel}>본인인증 정보가 없습니다</Text>
                <Text style={[styles.infoValue, { marginTop: 4, fontSize: 13, fontWeight: "400" }]}>
                  아이디/비밀번호 찾기를 위해 정보를 등록해주세요.
                </Text>
              </View>
            </View>
            <SettingItem
              label="내 정보 등록하기"
              onPress={() => router.push("/auth/fill-user-info")}
              style={{ borderBottomWidth: 0, paddingHorizontal: 0 }}
            />
          </View>
        )}

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>닉네임</Text>
            <Text style={styles.infoValue}>{userInfo?.nickname || "-"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>이메일</Text>
            <Text style={styles.infoValue}>{userInfo?.email || "-"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>이름</Text>
            <Text style={[styles.infoValue, !userInfo?.name && styles.infoValueEmpty]}>
              {userInfo?.name || "-"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>생년월일</Text>
            <Text style={[styles.infoValue, !userInfo?.birth && styles.infoValueEmpty]}>
              {userInfo?.birth || "-"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>전화번호</Text>
            <Text style={[styles.infoValue, !userInfo?.phone_num && styles.infoValueEmpty]}>
              {userInfo?.phone_num || "-"}
            </Text>
          </View>

          {/* 설정 메뉴 (로그인 상태) */}
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>설정</Text>
            <SettingItem
              label="비밀번호 변경"
              onPress={() => router.push("/auth/change-password")}
            />
            <SettingItem
              label="닉네임 변경"
              onPress={() => router.push("/auth/change-nickname")}
            />
          </View>

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
      </ScrollView>

      {/* 하단 고정 로그아웃 버튼 */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.logoutBtn}
          onPress={() => router.replace("/auth/logout-loading")}
        >
          <Text style={styles.logoutBtnText}>로그아웃</Text>
        </Pressable>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.BORDER,
    backgroundColor: colors.WHITE,
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
  infoValueEmpty: {
    color: colors.INACTIVE,
    fontWeight: "400",
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
  menuSection: {
    marginTop: 24,
    paddingTop: 16,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.INACTIVE,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.BLACK,
  },
  logoutBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.BLACK,
  },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    backgroundColor: "#fff",
  },
});
