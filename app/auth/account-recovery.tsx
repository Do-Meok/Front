import FoodThingLogo from "@/components/FoodThingLogo";
import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * 계정찾기 화면
 * 이메일 찾기와 비밀번호 찾기 옵션을 제공합니다.
 */
export default function AccountRecoveryScreen() {
    return (
        <SafeAreaView style={styles.safe}>
            {/* 뒤로가기 버튼 */}
            <Pressable
                onPress={() => router.back()}
                hitSlop={12}
                style={styles.backBtn}
            >
                <Ionicons name="chevron-back" size={28} color="#111" />
            </Pressable>

            <View style={styles.wrap}>
                {/* 로고 */}
                <View style={styles.logoBox}>
                    <FoodThingLogo size={44} />
                </View>

                {/* 타이틀 */}
                <View style={styles.titleBox}>
                    <Text style={styles.title}>계정 찾기</Text>
                    <Text style={styles.subtitle}>
                        이메일 또는 비밀번호를 찾으시나요?
                    </Text>
                </View>

                {/* 옵션 버튼 */}
                <View style={styles.optionsBox}>
                    <Pressable
                        style={styles.optionBtn}
                        onPress={() => router.push("/auth/find-email")}
                    >
                        <Ionicons name="mail-outline" size={32} color={colors.BLACK} />
                        <Text style={styles.optionBtnTitle}>이메일 찾기</Text>
                        <Text style={styles.optionBtnDesc}>
                            가입 시 입력한 정보로 이메일을 찾습니다
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.optionBtn}
                        onPress={() => router.push("/auth/find-password")}
                    >
                        <Ionicons name="lock-closed-outline" size={32} color={colors.BLACK} />
                        <Text style={styles.optionBtnTitle}>비밀번호 찾기</Text>
                        <Text style={styles.optionBtnDesc}>
                            이메일 인증을 통해 비밀번호를 재설정합니다
                        </Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.WHITE,
    },
    backBtn: {
        position: "absolute",
        top: 12,
        left: 12,
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },
    wrap: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: "center",
        gap: 32,
        alignItems: "center",
    },
    logoBox: {
        alignItems: "center",
    },
    titleBox: {
        alignItems: "center",
        gap: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: "900",
        color: colors.BLACK,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.INACTIVE,
        textAlign: "center",
    },
    optionsBox: {
        width: "100%",
        maxWidth: 420,
        gap: 16,
    },
    optionBtn: {
        width: "100%",
        padding: 24,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: colors.BORDER,
        backgroundColor: colors.WHITE,
        alignItems: "center",
        gap: 12,
    },
    optionBtnTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.BLACK,
    },
    optionBtnDesc: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.INACTIVE,
        textAlign: "center",
    },
});
