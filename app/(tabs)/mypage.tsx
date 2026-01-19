import { getUserInfo } from "@/api/auth";
import QueryErrorView from "@/components/QueryErrorView";
import { colors } from "@/constants";
import { getSecureStore } from "@/utils/secureStore";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyPageScreen() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // 토큰 존재 여부 확인
    getSecureStore("accessToken").then((token) => {
      setHasToken(!!token);
    });
  }, []);

  const {
    data: userInfo,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userInfo"],
    queryFn: getUserInfo,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.BLACK} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <QueryErrorView
          error={error}
          hasToken={hasToken}
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
});
