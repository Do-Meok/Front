import { colors } from "@/constants";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { usePathname } from "expo-router";
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getFridgeTabBarItems,
  getIngredientTabBarItems,
  getRecipeTabBarItems,
} from "./tabBarConfigs";

export default function SketchTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const inIngredients =
    pathname === "/ingredients" || pathname.startsWith("/ingredients/");
  const inRecipes = pathname === "/recipes" || pathname.startsWith("/recipes/");
  const inFridge =
    pathname === "/fridge" || pathname.startsWith("/fridge/");

  const ingredientItems = getIngredientTabBarItems(pathname);
  const recipeItems = getRecipeTabBarItems(pathname);
  const fridgeItems = getFridgeTabBarItems(pathname);

  const wrapStyle: StyleProp<ViewStyle> = [
    styles.bar,
    {
      paddingBottom: Math.max(10, insets.bottom),
      height: 70 + Math.max(0, insets.bottom - 10),
    },
  ];

  // ✅ 재료 영역이면 재료 전용 탭바
  if (inIngredients) {
    return (
      <View style={wrapStyle}>
        {ingredientItems.map((item, index) => {
          const color = item.focused ? colors.BLACK : colors.INACTIVE;

          return (
            <View
              key={item.key}
              style={[
                styles.itemWrap,
                index !== ingredientItems.length - 1 && styles.dividerRight,
              ]}
            >
              <Pressable
                onPress={() => {
                  if (!item.focused) item.go();
                }}
                style={({ pressed }) => [
                  styles.item,
                  pressed && { opacity: 0.7 },
                ]}
                android_ripple={{ color: "#00000010", borderless: false }}
              >
                {item.icon(item.focused, color)}
                <Text style={[styles.label, { color }]} numberOfLines={1}>
                  {item.label}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    );
  }

  // ✅ 레시피 영역이면 레시피 전용 탭바
  if (inRecipes) {
    return (
      <View style={wrapStyle}>
        {recipeItems.map((item, index) => {
          const color = item.focused ? colors.BLACK : colors.INACTIVE;

          return (
            <View
              key={item.key}
              style={[
                styles.itemWrap,
                index !== recipeItems.length - 1 && styles.dividerRight,
              ]}
            >
              <Pressable
                onPress={() => {
                  if (!item.focused) item.go();
                }}
                style={({ pressed }) => [
                  styles.item,
                  pressed && { opacity: 0.7 },
                ]}
                android_ripple={{ color: "#00000010", borderless: false }}
              >
                {item.icon(item.focused, color)}
                <Text style={[styles.label, { color }]} numberOfLines={1}>
                  {item.label}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    );
  }

  // ✅ 냉장고 영역이면 냉장고 전용 탭바
  if (inFridge) {
    return (
      <View style={wrapStyle}>
        {fridgeItems.map((item, index) => {
          const color = item.focused ? colors.BLACK : colors.INACTIVE;

          return (
            <View
              key={item.key}
              style={[
                styles.itemWrap,
                index !== fridgeItems.length - 1 && styles.dividerRight,
              ]}
            >
              <Pressable
                onPress={() => {
                  if (!item.focused) item.go();
                }}
                style={({ pressed }) => [
                  styles.item,
                  pressed && { opacity: 0.7 },
                ]}
                android_ripple={{ color: "#00000010", borderless: false }}
              >
                {item.icon(item.focused, color)}
                <Text style={[styles.label, { color }]} numberOfLines={1}>
                  {item.label}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    );
  }

  // ✅ 기본(메인) 탭바: 마이페이지 제외
  const visibleRoutes = state.routes.filter(
    (route) => route.name !== "mypage"
  );

  return (
    <View style={wrapStyle}>
      {visibleRoutes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === state.routes.findIndex((r) => r.key === route.key);

        const label =
          options.tabBarLabel?.toString() ?? options.title ?? route.name;

        const color = focused ? colors.BLACK : colors.INACTIVE;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: "tabLongPress", target: route.key });
        };

        return (
          <View
            key={route.key}
            style={[
              styles.itemWrap,
              index !== visibleRoutes.length - 1 && styles.dividerRight,
            ]}
          >
            <Pressable
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.item,
                pressed && { opacity: 0.7 },
              ]}
              android_ripple={{ color: colors.BLACK, borderless: false }}
            >
              {              options.tabBarIcon
                ? options.tabBarIcon({ focused, color, size: 20 })
                : null}

              <Text style={[styles.label, { color }]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.BORDER,
    backgroundColor: colors.WHITE,
    paddingTop: 8,

    ...Platform.select({
      android: { elevation: 10 },
      ios: {
        shadowColor: colors.BLACK,
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -4 },
      },
    }),
  },

  itemWrap: { flex: 1 },
  dividerRight: { borderRightWidth: 1, borderRightColor: colors.BORDER },

  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  label: { fontSize: 12, marginTop: 2 },
});
