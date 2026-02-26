import { useTutorial } from "@/providers/TutorialProvider";
import React from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { RNHoleView } from "react-native-hole-view";

const { height: H } = Dimensions.get("window");
const HOLE_PADDING = 10;
const DESC_GAP = 18;

export default function TutorialOverlay() {
  const {
    isActive,
    currentStep,
    holeConfig,
    nextStep,
    skipTutorial,
    currentStepIndex,
    totalSteps,
  } = useTutorial();

  if (!isActive || !currentStep) return null;

  const isLast = currentStepIndex === totalSteps - 1;

  // 홀 영역 (padding 추가)
  const holes = holeConfig
    ? [
        {
          x: Math.max(0, holeConfig.x - HOLE_PADDING),
          y: Math.max(0, holeConfig.y - HOLE_PADDING),
          width: holeConfig.width + HOLE_PADDING * 2,
          height: holeConfig.height + HOLE_PADDING * 2,
          borderRadius: (holeConfig.borderRadius ?? 12) + 4,
        },
      ]
    : [];

  // 설명 박스 위치 결정 (홀 기준 위/아래)
  const holeBottom = holeConfig
    ? holeConfig.y + holeConfig.height + HOLE_PADDING
    : 0;
  const descBelow = holeConfig
    ? holeConfig.y + holeConfig.height / 2 < H * 0.55
    : false;

  return (
    <RNHoleView
      style={[StyleSheet.absoluteFillObject, styles.overlay]}
      holes={holes}
    >
      {/* 건너뛰기 버튼 */}
      <Pressable style={styles.skipBtn} onPress={skipTutorial} hitSlop={12}>
        <Text style={styles.skipText}>건너뛰기</Text>
      </Pressable>

      {/* 설명 박스 */}
      {holeConfig ? (
        <View
          style={[
            styles.descBox,
            descBelow
              ? { top: holeBottom + DESC_GAP }
              : { bottom: H - holeConfig.y + HOLE_PADDING + DESC_GAP },
          ]}
        >
          <Text style={styles.descText}>{currentStep.description}</Text>
        </View>
      ) : (
        // 홀 없는 경우 (인트로 스텝) - 중앙 카드
        <View style={styles.centerBox}>
          <Text style={styles.centerText}>{currentStep.description}</Text>
        </View>
      )}

      {/* 하단: 스텝 카운트 + 다음 버튼 */}
      <View style={styles.bottomRow}>
        <Text style={styles.stepCount}>
          {currentStepIndex + 1} / {totalSteps}
        </Text>
        <Pressable style={styles.nextBtn} onPress={nextStep}>
          <Text style={styles.nextBtnText}>{isLast ? "완료" : "다음 →"}</Text>
        </Pressable>
      </View>
    </RNHoleView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  skipBtn: {
    position: "absolute",
    top: 56,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  skipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  descBox: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  descText: {
    fontSize: 15,
    color: "#111",
    fontWeight: "600",
    lineHeight: 23,
  },
  centerBox: {
    position: "absolute",
    top: H * 0.38,
    left: 32,
    right: 32,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  centerText: {
    fontSize: 18,
    color: "#111",
    fontWeight: "700",
    lineHeight: 28,
    textAlign: "center",
  },
  bottomRow: {
    position: "absolute",
    bottom: 52,
    left: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepCount: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 14,
    fontWeight: "600",
  },
  nextBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 28,
  },
  nextBtnText: {
    color: "#111",
    fontSize: 15,
    fontWeight: "800",
  },
});
