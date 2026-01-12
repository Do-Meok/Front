import AuthButton from "@/components/AuthButton";
import FoodThingLogo from "@/components/FoodThingLogo";
import { colors } from "@/constants";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  const params = useLocalSearchParams<{ from?: string }>();
  const fromOnboarding = params.from === "onboarding";
  const fromSkip = params.from === "skip";

  // 애니메이션 값들
  const logoY = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY = useRef(new Animated.Value(8)).current;
  const authOpacity = useRef(new Animated.Value(0)).current;
  const authY = useRef(new Animated.Value(12)).current;
  const [showSubtitle, setShowSubtitle] = useState(false);

  // 온보딩에서 온 경우 애니메이션 실행
  useEffect(() => {
    if (fromOnboarding) {
      // 초기 상태 설정
      logoY.setValue(0);
      setShowSubtitle(true);
      subtitleOpacity.setValue(0);
      subtitleY.setValue(8);
      authOpacity.setValue(0);
      authY.setValue(12);

      // 애니메이션 시퀀스 - 부드럽게 연결
      Animated.sequence([
        // 1. 로고 위로 이동
        Animated.timing(logoY, {
          toValue: -60,
          duration: 500,
          useNativeDriver: true,
        }),
        // 2. 문구 나타남
        Animated.parallel([
          Animated.timing(subtitleOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(subtitleY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // 3. 잠시 대기
        Animated.delay(500),
        // 4. 문구 사라지면서 동시에 버튼 나타남 (겹치는 효과)
        Animated.parallel([
          // 문구 사라짐
          Animated.parallel([
            Animated.timing(subtitleOpacity, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(subtitleY, {
              toValue: -8,
              duration: 250,
              useNativeDriver: true,
            }),
          ]),
          // 버튼 나타남 (문구가 절반 사라진 후 시작)
          Animated.sequence([
            Animated.delay(120),
            Animated.parallel([
              Animated.timing(authOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(authY, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]),
      ]).start(({ finished }) => {
        if (finished) {
          setShowSubtitle(false);
        }
      });
    } else if (fromSkip) {
      // 스킵한 경우: 애니메이션 없이 바로 표시
      logoY.setValue(-60);
      setShowSubtitle(false);
      subtitleOpacity.setValue(0);
      subtitleY.setValue(0);
      authOpacity.setValue(1);
      authY.setValue(0);
    } else {
      // 기본: AuthButton 화면 (애니메이션 없이 바로 표시)
      logoY.setValue(-60);
      setShowSubtitle(false);
      subtitleOpacity.setValue(0);
      subtitleY.setValue(0);
      authOpacity.setValue(1);
      authY.setValue(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromOnboarding, fromSkip]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.wrap}>
        {/* 로고 */}
        <Animated.View
          style={[styles.logoBox, { transform: [{ translateY: logoY }] }]}
        >
          <FoodThingLogo size={44} />
        </Animated.View>

        {/* 문구: 나타났다가 사라짐 */}
        {showSubtitle && (
          <Animated.Text
            style={[
              styles.subtitle,
              {
                opacity: subtitleOpacity,
                transform: [{ translateY: subtitleY }],
              },
            ]}
          >
            당신의 요리를 즐겁게
          </Animated.Text>
        )}

        {/* 로그인 버튼들: 문구 사라진 뒤 등장 */}
        <Animated.View
          style={[
            styles.authCard,
            {
              opacity: authOpacity,
              transform: [{ translateY: authY }],
            },
          ]}
        >
          <AuthButton />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  header: {
    height: 52,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  wrap: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 18,
    alignItems: "center",
  },
  logoBox: {
    alignItems: "center",
  },
  subtitle: {
    textAlign: "center",
    color: colors.GRAY,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
    marginBottom: 14,
  },
  authCard: {
    width: "100%",
    maxWidth: 420,
    padding: 14,
    gap: 10,
  },
});
