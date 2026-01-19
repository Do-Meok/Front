import Dots from "@/components/Dot";
import FoodThingLogo from "@/components/FoodThingLogo";
import { colors } from "@/constants";
import { useNavigationContext } from "@/providers/NavigationProvider";
import { getSecureStore } from "@/utils/secureStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: W } = Dimensions.get("window");

//임시 구현
type Slide = {
  key: string;
  title: string;
  desc: string;
  isLast?: boolean;
};

const SLIDES: Slide[] = [
  {
    key: "s1",
    title: "우리 앱은 이런 앱이에요",
    desc: "냉장고 재료를 관리하고, 레시피를 추천받고,\n버릴 재료를 줄여요.",
  },
  {
    key: "s2",
    title: "재료를 쉽게 기록",
    desc: "유통기한/카테고리로 정리해서\n한눈에 확인할 수 있어요.",
  },
  {
    key: "s3",
    title: "레시피를 빠르게 찾기",
    desc: "검색/필터로 바로 찾고\n필요한 것만 골라보세요.",
  },
];

export default function Onboarding() {
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const { checkAuthState, setOnboardingCompleted } = useNavigationContext();

  const isLast = useMemo(() => index >= SLIDES.length - 1, [index]);

  const onPressSkip = async () => {
    // 로컬 스토리지에 온보딩 완료 저장
    await AsyncStorage.setItem("onboarding_completed", "true");
    // 상태를 즉시 업데이트 (NavigationProvider가 감지하도록)
    setOnboardingCompleted(true);
    // 인증 상태 재확인
    await checkAuthState();
    
    // 토큰 확인 (상태 업데이트를 기다리기 위해 직접 확인)
    const token = await getSecureStore("accessToken");
    
    // 로그인되어 있으면 홈으로, 아니면 auth로 이동
    if (token) {
      router.replace("/(tabs)");
    } else {
      router.replace("/auth?from=skip");
    }
  };

  const onPressNext = async () => {
    if (index >= SLIDES.length - 1) {
      // 마지막 슬라이드에서 다음을 누르면 온보딩 완료 처리
      await AsyncStorage.setItem("onboarding_completed", "true");
      // 상태를 즉시 업데이트 (NavigationProvider가 감지하도록)
      setOnboardingCompleted(true);
      // 인증 상태 재확인
      await checkAuthState();
      
      // 토큰 확인 (상태 업데이트를 기다리기 위해 직접 확인)
      const token = await getSecureStore("accessToken");
      
      // 로그인되어 있으면 홈으로, 아니면 auth로 이동
      if (token) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth?from=onboarding");
      }
      return;
    }
    const next = index + 1;
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 상단: 빈 공간 (스킵 버튼 제거) */}
      <View style={styles.topRow}>
        <View />
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        scrollEnabled={true}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const next = Math.round(e.nativeEvent.contentOffset.x / W);
          setIndex(next);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: W }]}>
            <View style={styles.content}>
              <FoodThingLogo size={36} />
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
            </View>
          </View>
        )}
      />

      {/* 하단: dots + next + 다시 안보기 */}
      <View style={styles.bottomArea}>
        <Dots index={index} total={SLIDES.length} />

        <Pressable style={styles.nextBtn} onPress={onPressNext}>
          <Text style={styles.nextBtnText}>
            {isLast ? "시작하기" : "다음"}
          </Text>
        </Pressable>
        <Pressable style={styles.skipBtn} onPress={onPressSkip}>
          <Text style={styles.skipBtnText}>다시 안보기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  topRow: {
    height: 52,
    paddingHorizontal: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skipBtn: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  skipBtnText: {
    fontSize: 14,
    color: colors.INACTIVE,
    fontWeight: "600",
  },

  slide: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.BLACK,
    lineHeight: 32,
  },
  desc: {
    fontSize: 16,
    color: colors.GRAY,
    lineHeight: 24,
  },
  bottomArea: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 12,
  },
  nextBtn: {
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.BLACK,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: "700",
  },
});
