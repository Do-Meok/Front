import { useTutorial } from "@/providers/TutorialProvider";
import { useSegments } from "expo-router";
import React from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

const { height: H } = Dimensions.get("window");
const HOLE_PADDING = 10;
const DESC_GAP = 18;
const OVERLAY_COLOR = "rgba(0,0,0,0.7)";

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

  // (tabs) 안에서만 표시 — 로그인 화면 등에 절대 뜨지 않도록
  const segments = useSegments();
  const inTabs = segments[0] === "(tabs)";

  if (!isActive || !currentStep || !inTabs) return null;

  const isLast = currentStepIndex === totalSteps - 1;

  // 홀 좌표 계산 (padding 포함)
  const hx = holeConfig ? Math.max(0, holeConfig.x - HOLE_PADDING) : 0;
  const hy = holeConfig ? Math.max(0, holeConfig.y - HOLE_PADDING) : 0;
  const hw = holeConfig ? holeConfig.width + HOLE_PADDING * 2 : 0;
  const hh = holeConfig ? holeConfig.height + HOLE_PADDING * 2 : 0;
  const hr = holeConfig ? (holeConfig.borderRadius ?? 12) + 4 : 0;

  // 설명 박스 위치 결정 (홀 기준 위/아래)
  const descBelow = holeConfig
    ? holeConfig.y + holeConfig.height / 2 < H * 0.55
    : false;

  const ui = (
    <>
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
              ? { top: hy + hh + DESC_GAP }
              : { bottom: H - hy + DESC_GAP },
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
    </>
  );

  // 홀 없는 경우 (인트로): 전체 화면 덮기
  if (!holeConfig) {
    return (
      <View style={[StyleSheet.absoluteFillObject, styles.overlay]}>{ui}</View>
    );
  }

  // 홀 있는 경우: 4-Rectangle 기법으로 스포트라이트 구현
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Top */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: hy,
          backgroundColor: OVERLAY_COLOR,
        }}
      />
      {/* Bottom */}
      <View
        style={{
          position: "absolute",
          top: hy + hh,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: OVERLAY_COLOR,
        }}
      />
      {/* Left */}
      <View
        style={{
          position: "absolute",
          top: hy,
          left: 0,
          width: hx,
          height: hh,
          backgroundColor: OVERLAY_COLOR,
        }}
      />
      {/* Right */}
      <View
        style={{
          position: "absolute",
          top: hy,
          left: hx + hw,
          right: 0,
          height: hh,
          backgroundColor: OVERLAY_COLOR,
        }}
      />
      {/* 홀 하이라이트 테두리 */}
      <View
        style={{
          position: "absolute",
          top: hy,
          left: hx,
          width: hw,
          height: hh,
          borderRadius: hr,
          borderWidth: 2,
          borderColor: "rgba(255,255,255,0.85)",
        }}
        pointerEvents="none"
      />
      {ui}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: OVERLAY_COLOR,
  },
  skipBtn: {
    position: "absolute",
    top: 56,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
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
    backgroundColor: "rgba(15,15,15,0.82)",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  descText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
    lineHeight: 23,
  },
  centerBox: {
    position: "absolute",
    top: H * 0.38,
    left: 32,
    right: 32,
    backgroundColor: "rgba(15,15,15,0.82)",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  centerText: {
    fontSize: 18,
    color: "#fff",
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
