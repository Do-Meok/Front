import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const ICONS = [
  { name: "restaurant-outline" as const },
  { name: "nutrition-outline" as const },
  { name: "flame-outline" as const },
];

const DURATION = 400;
const ICON_SIZE = 44;

/**
 * 앱 대표 로딩 화면.
 * 레시피 로딩, 초기 스플래시 등 어디서든 재사용 가능합니다.
 */
export default function RecipeLoadingScreen({
  message = "레시피를 받아오는 중입니다.",
}: {
  message?: string;
}) {
  const a = useSharedValue(0);
  const b = useSharedValue(0);
  const c = useSharedValue(0);

  const animatedStyleA = useAnimatedStyle(() => ({
    opacity: 0.35 + a.value * 0.65,
    transform: [{ scale: 0.85 + a.value * 0.25 }],
  }));
  const animatedStyleB = useAnimatedStyle(() => ({
    opacity: 0.35 + b.value * 0.65,
    transform: [{ scale: 0.85 + b.value * 0.25 }],
  }));
  const animatedStyleC = useAnimatedStyle(() => ({
    opacity: 0.35 + c.value * 0.65,
    transform: [{ scale: 0.85 + c.value * 0.25 }],
  }));

  useEffect(() => {
    a.value = withRepeat(
      withSequence(
        withTiming(1, { duration: DURATION }),
        withDelay(800, withTiming(0, { duration: DURATION }))
      ),
      -1,
      false
    );
    b.value = withRepeat(
      withSequence(
        withDelay(400, withTiming(1, { duration: DURATION })),
        withDelay(800, withTiming(0, { duration: DURATION }))
      ),
      -1,
      false
    );
    c.value = withRepeat(
      withSequence(
        withDelay(800, withTiming(1, { duration: DURATION })),
        withDelay(800, withTiming(0, { duration: DURATION }))
      ),
      -1,
      false
    );
  }, [a, b, c]);

  return (
    <View style={styles.container}>
      <View style={styles.iconsRow}>
        <Animated.View style={[styles.iconWrap, animatedStyleA]}>
          <Ionicons
            name={ICONS[0].name}
            size={ICON_SIZE}
            color={colors.BLACK}
          />
        </Animated.View>
        <Animated.View style={[styles.iconWrap, animatedStyleB]}>
          <Ionicons
            name={ICONS[1].name}
            size={ICON_SIZE}
            color={colors.BLACK}
          />
        </Animated.View>
        <Animated.View style={[styles.iconWrap, animatedStyleC]}>
          <Ionicons
            name={ICONS[2].name}
            size={ICON_SIZE}
            color={colors.BLACK}
          />
        </Animated.View>
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingHorizontal: 32,
  },
  iconsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.GRAY,
    textAlign: "center",
  },
});
