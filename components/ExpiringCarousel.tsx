import React, { useMemo, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

type ExpiringItem = {
  id: string;
  name: string;
  expiresAt: string; // ISO or yyyy-mm-dd
};

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = Math.min(260, SCREEN_W * 0.62);
const GAP = 12;
const SNAP = CARD_W + GAP;

function daysLeft(expiresAt: string) {
  const end = new Date(expiresAt);
  const now = new Date();
  // 자정 기준으로 계산(대충용)
  const diff = end.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function ExpiringCarousel({
  title = "빨리 드셔야 해요! 🚨",
  items,
  onPressItem,
}: {
  title?: string;
  items: ExpiringItem[];
  onPressItem?: (item: ExpiringItem) => void;
}) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);

  const computed = useMemo(() => {
    return items.map((it) => ({
      ...it,
      dday: daysLeft(it.expiresAt),
    }));
  }, [items]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>

      <Animated.FlatList
        data={computed}
        keyExtractor={(it) => it.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        snapToInterval={SNAP}
        decelerationRate="fast"
        disableIntervalMomentum
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onViewableItemsChanged={({ viewableItems }) => {
          const first = viewableItems?.[0]?.index;
          if (typeof first === "number") setIndex(first);
        }}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => {
          const badge = item.dday <= 0 ? "D-DAY" : `D-${item.dday}`;
          const danger = item.dday <= 2;

          return (
            <Pressable
              onPress={() => onPressItem?.(item)}
              style={danger ? styles.cardDanger : styles.cardSafe}
            >
              <Text style={styles.badge}>{badge}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.sub}>유통기한: {item.expiresAt}</Text>
            </Pressable>
          );
        }}
      />

      {/* 페이지 점 */}
      <View style={styles.dots}>
        {items.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === index ? styles.dotActive : styles.dotIdle,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16 },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  card: {
    width: CARD_W,
    borderRadius: 16,
    padding: 16,
  },
  cardDanger: {
    backgroundColor: "#ff6b6b",
  },
  cardSafe: {
    backgroundColor: "#ffd166",
  },
  badge: {
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 8,
    color: "#111",
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
  },
  sub: {
    marginTop: 6,
    color: "#111",
    opacity: 0.8,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: "#111",
  },
  dotIdle: {
    backgroundColor: "#111",
    opacity: 0.25,
  },
});
