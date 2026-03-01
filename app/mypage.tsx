import PageHeader from "@/components/PageHeader";
import QueryErrorView from "@/components/QueryErrorView";
import SettingItem from "@/components/SettingItem";
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
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyPageScreen() {
  const { userInfoQuery } = useAuth();
  const {
    data: userInfo,
    isLoading,
    error,
    refetch,
  } = userInfoQuery;
  const { isOnboardingCompleted, setOnboardingCompleted, hasToken } =
    useNavigationContext();

  const missingInfo =
    userInfo && (!userInfo.name || !userInfo.birth || !userInfo.phone_num);

  // 백엔드가 provider 필드를 반환할 경우 카카오 유저 감지
  const isKakaoUser = userInfo?.provider === "kakao";

  // 닉네임 첫 글자를 아바타에 표시
  const avatarText = userInfo?.nickname ? userInfo.nickname.charAt(0) : "?";

  function renderBody() {
    if (isLoading && !userInfo) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.BLACK} />
        </View>
      );
    }

    if (error && !userInfo) {
      return (
        <QueryErrorView
          error={error}
          hasToken={!!hasToken}
          onRetry={refetch}
          onLogin={() => router.replace("/auth/logout-loading")}
        />
      );
    }

    return (
      <>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 프로필 */}
          <View style={styles.profileSection}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{avatarText}</Text>
            </View>
            <Text style={styles.profileNickname}>
              {userInfo?.nickname || "-"}
            </Text>
            {isKakaoUser && (
              <View style={styles.kakaoBadge}>
                <Text style={styles.kakaoBadgeText}>카카오 로그인</Text>
              </View>
            )}
          </View>

          {/* 본인인증 정보 없을 시 안내 카드 (탭하면 등록 화면으로 이동) */}
          {missingInfo && (
            <Pressable
              style={styles.missingInfoCard}
              onPress={() =>
                router.push({
                  pathname: "/auth/fill-user-info" as any,
                  params: {
                    name: userInfo?.name ?? "",
                    birth: userInfo?.birth ?? "",
                    phone_num: userInfo?.phone_num ?? "",
                  },
                })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.missingInfoTitle}>
                  본인인증 정보가 없습니다
                </Text>
                <Text style={styles.missingInfoDesc}>
                  아이디/비밀번호 찾기를 위해 정보를 등록해주세요.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.INACTIVE} />
            </Pressable>
          )}

          {/* 계정 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>계정 정보</Text>
            <View style={styles.infoCard}>
              <InfoRow label="이메일" value={userInfo?.email} />
              <InfoRow label="이름" value={userInfo?.name} />
              <InfoRow label="생년월일" value={userInfo?.birth} />
              <InfoRow
                label="전화번호"
                value={userInfo?.phone_num}
                isLast
              />
            </View>
          </View>

          {/* 설정 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>설정</Text>
            <View style={styles.settingsCard}>
              <SettingItem
                label="닉네임 변경"
                onPress={() => router.push("/auth/change-nickname")}
                style={styles.settingItem}
              />
              {/* 카카오 유저는 비밀번호가 없으므로 숨김 */}
              {!isKakaoUser && (
                <SettingItem
                  label="비밀번호 변경"
                  onPress={() => router.push("/auth/change-password")}
                  style={styles.settingItem}
                />
              )}
              <SettingItem
                label={missingInfo ? "내 정보 등록하기" : "내 정보 수정하기"}
                onPress={() =>
                  router.push({
                    pathname: "/auth/fill-user-info" as any,
                    params: {
                      name: userInfo?.name ?? "",
                      birth: userInfo?.birth ?? "",
                      phone_num: userInfo?.phone_num ?? "",
                    },
                  })
                }
                style={[styles.settingItem, { borderBottomWidth: 0 }]}
              />
            </View>
          </View>

          {/* 개발자 옵션 (임시: 온보딩 다시 보기) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>개발자 옵션</Text>
            <View style={styles.infoCard}>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>온보딩 다시 보기</Text>
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
      </>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <PageHeader
          title="마이페이지"
          leftChild={
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="chevron-back" size={28} color="#111" />
            </Pressable>
          }
        />
      </View>
      {renderBody()}
    </SafeAreaView>
  );
}

// 계정 정보 행 컴포넌트
function InfoRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value?: string | null;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, isLast && { borderBottomWidth: 0 }]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, !value && styles.infoValueEmpty]}>
        {value || "미등록"}
      </Text>
    </View>
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
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 24,
  },

  // ── 프로필 ──────────────────────────────────────────────
  profileSection: {
    alignItems: "center",
    gap: 8,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEE500",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000000CC",
  },
  profileNickname: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.BLACK,
  },
  kakaoBadge: {
    backgroundColor: "#FEE500",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  kakaoBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000000CC",
  },

  // ── 미등록 안내 카드 ────────────────────────────────────
  missingInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  missingInfoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.BLACK,
    marginBottom: 4,
  },
  missingInfoDesc: {
    fontSize: 13,
    color: colors.INACTIVE,
  },

  // ── 섹션 ────────────────────────────────────────────────
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.INACTIVE,
    paddingHorizontal: 4,
    letterSpacing: 0.5,
  },

  // ── 카드 ────────────────────────────────────────────────
  infoCard: {
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.WHITE,
  },
  settingsCard: {
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.WHITE,
  },
  settingItem: {
    paddingHorizontal: 16,
  },

  // ── 정보 행 ─────────────────────────────────────────────
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
    backgroundColor: colors.WHITE,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
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

  // ── 하단 로그아웃 ────────────────────────────────────────
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.BORDER,
    backgroundColor: colors.WHITE,
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
});
