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

    // 조회 성공 → 유저 정보 표시
    return (
      <>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 프로필 아이콘 */}
          <View style={styles.profileIcon}>
            <Ionicons name="person" size={48} color={colors.BLACK} />
          </View>

          {/* 유저 정보 - 본인인증 정보 없을 시 안내 카드 */}
          {missingInfo && (
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <View>
                  <Text style={styles.infoLabel}>본인인증 정보가 없습니다</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      { marginTop: 4, fontSize: 13, fontWeight: "400" },
                    ]}
                  >
                    아이디/비밀번호 찾기를 위해 정보를 등록해주세요.
                  </Text>
                </View>
              </View>
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
              <Text
                style={[
                  styles.infoValue,
                  !userInfo?.name && styles.infoValueEmpty,
                ]}
              >
                {userInfo?.name || "-"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>생년월일</Text>
              <Text
                style={[
                  styles.infoValue,
                  !userInfo?.birth && styles.infoValueEmpty,
                ]}
              >
                {userInfo?.birth || "-"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>전화번호</Text>
              <Text
                style={[
                  styles.infoValue,
                  !userInfo?.phone_num && styles.infoValueEmpty,
                ]}
              >
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
