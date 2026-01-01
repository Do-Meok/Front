import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router, usePathname } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MiniItem = {
  key: string;
  label: string;
  href: string;
  focused: boolean;
  icon: (focused: boolean, color: string) => React.ReactNode;
};

export default function SketchTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const inIngredients =
    pathname === "/ingredients" || pathname.startsWith("/ingredients/");

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

  // ✅ 여기서 "무엇을 렌더할지" 결정
  if (inIngredients) {
    return (
      <View
        style={[
          styles.bar,
          {
            paddingBottom: Math.max(10, insets.bottom),
            height: 70 + Math.max(0, insets.bottom - 10),
          },
        ]}
      >
        {ingredientItems.map((item, index) => {
          const color = item.focused ? colors.ACTIVE : colors.INACTIVE;

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

  // ✅ 기본(메인) 탭바는 기존 코드 그대로 사용
  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(10, insets.bottom),
          height: 70 + Math.max(0, insets.bottom - 10),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;

        const label =
          options.tabBarLabel?.toString() ?? options.title ?? route.name;

        const color = focused ? colors.ACTIVE : colors.INACTIVE;

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
              android_ripple={{ color: "#00000010", borderless: false }}
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
    backgroundColor: "#fff",
    paddingTop: 8,

    ...Platform.select({
      android: { elevation: 10 },
      ios: {
        shadowColor: "#000",
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
