import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router, usePathname } from "expo-router";
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

  // ✅ 재료 전용 탭바(기존 그대로)
  const ingredientItems = [
    {
      key: "home",
      label: "홈",
      focused: pathname === "/" || pathname === "/index",
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "arrow-back" : "arrow-back-outline"}
          size={26}
          color={color}
        />
      ),
      go: () => router.replace("/"),
    },
    {
      key: "ingredients",
      label: "재료",
      focused: pathname === "/ingredients",
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "nutrition" : "nutrition-outline"}
          size={26}
          color={color}
        />
      ),
      go: () => router.replace("/ingredients"),
    },
    {
      key: "manage",
      label: "재료 관리",
      focused: pathname.startsWith("/ingredients/manage"),
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "create" : "create-outline"}
          size={26}
          color={color}
        />
      ),
      go: () => router.replace("/ingredients/manage"),
    },
    {
      key: "fridge",
      label: "냉장고 관리",
      focused: pathname.startsWith("/ingredients/fridge"),
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "snow" : "snow-outline"}
          size={26}
          color={color}
        />
      ),
      go: () => router.replace("/ingredients/fridge"),
    },
  ];

  // ✅ 레시피 전용 탭바(추가)
  const recipeItems = [
    {
      key: "home",
      label: "홈",
      focused: pathname === "/" || pathname === "/index",
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "arrow-back" : "arrow-back-outline"}
          size={26}
          color={color}
        />
      ),
      go: () => router.replace("/"),
    },
    {
      key: "recommend",
      label: "레시피 추천",
      focused: pathname.startsWith("/recipes/recommend"),
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "sparkles" : "sparkles-outline"}
          size={26}
          color={color}
        />
      ),
      go: () => router.replace("/recipes/recommend"),
    },
    {
      key: "recipes",
      label: "레시피",
      // /recipes, /recipes/[id] 같은 상세도 여기로 묶이게 처리
      focused:
        inRecipes &&
        !pathname.startsWith("/recipes/recommend") &&
        !pathname.startsWith("/recipes/log"),
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "book" : "book-outline"}
          size={26}
          color={color}
        />
      ),
      go: () => router.replace("/recipes"),
    },
    {
      key: "log",
      label: "요리 기록",
      focused: pathname.startsWith("/recipes/log"),
      icon: (focused: boolean, color: string) => (
        <Ionicons
          name={focused ? "calendar" : "calendar-outline"}
          size={26}
          color={color}
        />
      ),
      go: () => router.replace("/recipes/log"),
    },
  ];

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

  // ✅ 기본(메인) 탭바: 기존 그대로
  return (
    <View style={wrapStyle}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;

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
              index !== state.routes.length - 1 && styles.dividerRight,
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
              {options.tabBarIcon
                ? options.tabBarIcon({ focused, color, size: 26 })
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
