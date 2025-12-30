import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import EllipsizedDesc from "./EllipsizedDesc";

type FeaturedRecipe = {
  id: string;
  title: string;
  desc: string;
  imageUri?: string; // remote uri or undefined
};

const { width: SCREEN_W } = Dimensions.get("window");
const GAP = 12;
const CARD_W = Math.min(SCREEN_W * 0.86, 360); // 카드 폭
const SNAP = CARD_W + GAP;

export default function FeaturedRecipeCarousel({
  titleLabel = "추천 메뉴",
  items,
  onPressItem,
}: {
  titleLabel?: string;
  items: FeaturedRecipe[];
  onPressItem?: (item: FeaturedRecipe) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>{titleLabel}</Text>

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        snapToInterval={SNAP}
        decelerationRate="fast"
        disableIntervalMomentum
        viewabilityConfig={{ itemVisiblePercentThreshold: 70 }}
        onViewableItemsChanged={({ viewableItems }) => {
          const first = viewableItems?.[0]?.index;
          if (typeof first === "number") setActiveIndex(first);
        }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => onPressItem?.(item)}>
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={styles.heroImage} />
            ) : (
              <View style={[styles.heroImage, styles.imagePlaceholder]} />
            )}

            <View style={styles.textArea}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              <EllipsizedDesc text={item.desc} />
            </View>
          </Pressable>
        )}
      />

      {/* 페이지 점 */}
      <View style={styles.dots}>
        {items.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex ? styles.dotActive : styles.dotIdle,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginHorizontal: 16,
    marginBottom: 10,
    color: "#111",
  },
  card: {
    width: CARD_W,
    borderRadius: 18,
    backgroundColor: "#f2f2f2",
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: 210,
  },
  imagePlaceholder: {
    backgroundColor: "#ddd",
  },
  textArea: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111",
  },

  dots: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { backgroundColor: "#111" },
  dotIdle: { backgroundColor: "#111", opacity: 0.25 },
});
