import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import EllipsizedDesc from "./EllipsizedDesc";

export type FeaturedRecipe = {
  id: string;
  title: string;
  desc: string;
  image?: string | ImageSourcePropType;
  /** 난이도 1~5 (별 표시용, 없으면 표시 안 함) */
  difficulty?: number;
};

const { width: SCREEN_W } = Dimensions.get("window");
const GAP = 12;
const CARD_W = Math.min(SCREEN_W * 0.86, 360);
const SNAP = CARD_W + GAP;
const DEFAULT_HERO_HEIGHT = 210;

function toImageSource(
  image?: FeaturedRecipe["image"],
): ImageSourcePropType | null {
  if (!image) return null;
  // remote uri
  if (typeof image === "string") return { uri: image };
  // local require(...)
  return image;
}

export default function FeaturedRecipeCarousel({
  titleLabel = "추천 메뉴",
  description,
  items,
  onPressItem,
  heroImageHeight = DEFAULT_HERO_HEIGHT,
}: {
  titleLabel?: string;
  /** 제목 아래 표시할 설명 텍스트 */
  description?: string;
  items: FeaturedRecipe[];
  onPressItem?: (item: FeaturedRecipe) => void;
  heroImageHeight?: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>{titleLabel}</Text>
      {description ? (
        <Text style={styles.sectionDesc}>{description}</Text>
      ) : null}

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
        renderItem={({ item }) => {
          const src = toImageSource(item.image);

          const heroStyle = [styles.heroImage, { height: heroImageHeight }];
          return (
            <Pressable style={styles.card} onPress={() => onPressItem?.(item)}>
              {src ? (
                <Image source={src} style={heroStyle} />
              ) : (
                <View style={[heroStyle, styles.imagePlaceholder]} />
              )}

              <View style={styles.textArea}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <EllipsizedDesc text={item.desc} />
                {typeof item.difficulty === "number" && (
                  <Text style={styles.difficulty}>
                    난이도: {"★".repeat(Math.min(5, Math.max(0, item.difficulty)))}
                    {"☆".repeat(5 - Math.min(5, Math.max(0, item.difficulty)))}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        }}
      />

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
    marginBottom: 4,
    color: "#111",
  },
  sectionDesc: {
    fontSize: 13,
    color: "#666",
    marginHorizontal: 16,
    marginBottom: 10,
    lineHeight: 18,
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
  difficulty: {
    marginTop: 6,
    fontSize: 12,
    color: "#666",
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
