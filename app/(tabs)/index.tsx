import { colors } from "@/constants";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ExpiringCarousel from "@/components/ExpiringCarousel";
import FeaturedRecipeCarousel from "@/components/FeaturedRecipeCarousel";
import HomeHeader from "@/components/HomeHeader";

const featured = [
  {
    id: "r1",
    title: "크림 파스타",
    desc: "우유(D-2)를 처리할 수 있는 크림 파스타 어때요?  ",
    imageUri: "https://picsum.photos/600/400?1",
  },
  {
    id: "r2",
    title: "두부김치",
    desc: "두부가 오늘까지라면? 간단하게 한 끼 해결!",
    imageUri: "https://picsum.photos/600/400?2",
  },
  {
    id: "r3",
    title: "계란볶음밥",
    desc: "재료 적어도 가능한 빠른 메뉴!",
    imageUri: "https://picsum.photos/600/400?3",
  },
];

const expiring = [
  { id: "1", name: "우유", expiresAt: "2025-12-31" },
  { id: "2", name: "양파", expiresAt: "2026-01-02" },
  { id: "3", name: "두부", expiresAt: "2025-12-30" },
  { id: "4", name: "달걀", expiresAt: "2026-01-01" },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* 홈 헤더 */}
      <HomeHeader onPressBell={() => {}} />
      <View style={styles.page}>
        {/* 오늘의 추천 */}
        <FeaturedRecipeCarousel
          titleLabel="오늘의 추천"
          items={featured}
          onPressItem={(item) => {
            // router.push(`/recipes/${item.id}`) 같은 식으로 이동
          }}
        />

        {/* 유통기한 마감 */}
        <ExpiringCarousel
          items={expiring}
          onPressItem={(item) => {
            // 예: 해당 재료로 레시피 추천 화면 이동
            // router.push(`/recipes?ingredient=${encodeURIComponent(item.name)}`)
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },

  writeButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#ff5e08ff",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    shadowOpacity: 0.5,
    elevation: 2,
  },
  page: {
    flex: 1,
    marginTop: 10,
    gap: 45,
  },
});
