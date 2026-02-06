import type { FeaturedRecipe } from "@/components/FeaturedRecipeCarousel";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

function toImageSource(
  image?: FeaturedRecipe["image"],
): ImageSourcePropType | null {
  if (!image) return null;
  if (typeof image === "string") return { uri: image };
  return image;
}

export default function RecipeLogList({
  items,
  onPressItem,
}: {
  items: FeaturedRecipe[];
  onPressItem?: (item: FeaturedRecipe) => void;
}) {
  return (
    <FlatList
      data={items}
      keyExtractor={(it) => it.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => {
        const src = toImageSource(item.image);
        return (
          <Pressable
            style={styles.row}
            onPress={() => onPressItem?.(item)}
            android_ripple={{ color: "#eee" }}
          >
            {src ? (
              <Image source={src} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]}>
                <Text style={styles.placeholderIcon}>🍽</Text>
              </View>
            )}
            <View style={styles.textArea}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              {item.desc ? (
                <Text style={styles.desc} numberOfLines={1}>
                  {item.desc}
                </Text>
              ) : null}
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 12,
    paddingBottom: 40,
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginLeft: 68,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  thumbPlaceholder: {
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: 20,
  },
  textArea: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  desc: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: "#bbb",
    fontWeight: "300",
    marginLeft: 8,
  },
});
