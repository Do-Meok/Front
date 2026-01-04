import AuthButton from "@/components/AuthButton";
import Dots from "@/components/Dot";
import FoodThingLogo from "@/components/FoodThingLogo";
import { colors } from "@/constants";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
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
  {
    key: "s4",
    title: "",
    desc: "",
    isLast: true,
  },
];

export default function Onboarding() {
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const [showLastSubtitle, setShowLastSubtitle] = useState(true);

  const isLast = useMemo(() => SLIDES[index]?.isLast, [index]);

  const LAST_INDEX = SLIDES.length - 1;

  const goToLast = () => {
    listRef.current?.scrollToIndex({ index: LAST_INDEX, animated: true });
    setIndex(LAST_INDEX);
  };

  const onPressSkip = () => {
    goToLast();
  };

  const params = useLocalSearchParams<{ start?: string; anim?: string }>();
  const disableLastAnim = params.anim === "0";

  useEffect(() => {
    if (params.start !== "last") return;

    // FlatList 렌더 이후에 이동 (안정적으로)
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: LAST_INDEX, animated: false });
      setIndex(LAST_INDEX);
    });
  }, [params.start]);

  const onPressNext = () => {
    if (index >= SLIDES.length - 1) return;
    const next = index + 1;
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
  };

  const lastLogoY = useRef(new Animated.Value(0)).current; // 0 -> -60
  // 문구
  const lastSubtitleOpacity = useRef(new Animated.Value(0)).current; // 0 -> 1 -> 0
  const lastSubtitleY = useRef(new Animated.Value(8)).current; // 8 -> 0 -> -6
  // 로그인창
  const lastAuthOpacity = useRef(new Animated.Value(0)).current; // 0 -> 1
  const lastAuthY = useRef(new Animated.Value(12)).current; // 12 -> 0

  // 애니메이션
  useEffect(() => {
    if (!isLast) return;

    if (disableLastAnim) {
      lastLogoY.setValue(-60);
      setShowLastSubtitle(false);

      lastSubtitleOpacity.setValue(0);
      lastSubtitleY.setValue(0);

      lastAuthOpacity.setValue(1);
      lastAuthY.setValue(0);
      return;
    }

    // ✅ 기존 애니메이션 (처음 진입)
    lastLogoY.setValue(0);

    setShowLastSubtitle(true);
    lastSubtitleOpacity.setValue(0);
    lastSubtitleY.setValue(8);

    lastAuthOpacity.setValue(0);
    lastAuthY.setValue(12);

    Animated.sequence([
      Animated.timing(lastLogoY, {
        toValue: -60,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(lastSubtitleOpacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(lastSubtitleY, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(550),
      Animated.timing(lastSubtitleOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(lastAuthOpacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(lastAuthY, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) setShowLastSubtitle(false);
    });
  }, [isLast, disableLastAnim]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* 상단: 스킵 */}
      <View style={styles.topRow}>
        <View />
        {!isLast ? (
          <Pressable onPress={onPressSkip} hitSlop={10}>
            <Text style={styles.skipText}>스킵</Text>
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        scrollEnabled={!isLast}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const next = Math.round(e.nativeEvent.contentOffset.x / W);
          setIndex(next);
        }}
        renderItem={({ item }) => {
          // ✅ 마지막 페이지: 다른 레이아웃
          if (item.isLast) {
            return (
              <View style={[styles.slide, { width: W }]}>
                <View style={styles.contentLikeOnboarding}>
                  {/* 로고 */}
                  <Animated.View
                    style={{ transform: [{ translateY: lastLogoY }] }}
                  >
                    <FoodThingLogo size={44} />
                  </Animated.View>

                  {/* 문구: 나타났다가 사라짐 */}
                  {showLastSubtitle && (
                    <Animated.Text
                      style={[
                        styles.subtitle,
                        {
                          opacity: lastSubtitleOpacity,
                          transform: [{ translateY: lastSubtitleY }],
                        },
                      ]}
                    >
                      당신의 요리를 즐겁게
                    </Animated.Text>
                  )}

                  {/* 로그인: 문구 사라진 뒤 등장 */}
                  <Animated.View
                    style={[
                      styles.card,
                      {
                        opacity: lastAuthOpacity,
                        transform: [{ translateY: lastAuthY }],
                      },
                    ]}
                  >
                    <AuthButton />
                  </Animated.View>
                </View>
              </View>
            );
          }

          // ✅ 일반 슬라이드
          return (
            <View style={[styles.slide, { width: W }]}>
              <View style={styles.content}>
                <FoodThingLogo size={36} />
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.desc}>{item.desc}</Text>
              </View>
            </View>
          );
        }}
      />

      {/* 하단: dots + next */}
      <View style={styles.bottomArea}>
        {!isLast && <Dots index={index} total={SLIDES.length} />}

        {!isLast && (
          <Pressable style={styles.nextBtn} onPress={onPressNext}>
            <Text style={styles.nextBtnText}>다음</Text>
          </Pressable>
        )}
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
  skipText: {
    fontSize: 15,
    color: colors.GRAY,
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
  contentLikeOnboarding: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  card: {
    width: "100%",
    padding: 14,
    gap: 10,
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
  subtitle: {
    textAlign: "center",
    color: colors.GRAY,
    marginBottom: 14,

    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
  },
});
