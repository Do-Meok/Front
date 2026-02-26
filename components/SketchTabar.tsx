import { colors } from "@/constants";
import { useTutorial } from "@/providers/TutorialProvider";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabBarItem from "./TabBarItem";
import {
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
  const tabBarRef = useRef<View>(null);
  const { registerTarget, unregisterTarget } = useTutorial();

  useEffect(() => {
    registerTarget("tab-bar", tabBarRef);
    return () => unregisterTarget("tab-bar");
  }, [registerTarget, unregisterTarget]);

  const inIngredients =
    pathname === "/ingredients" || pathname.startsWith("/ingredients/");
  const inRecipes = pathname === "/recipes" || pathname.startsWith("/recipes/");

  const ingredientItems = getIngredientTabBarItems(pathname);
  const recipeItems = getRecipeTabBarItems(pathname);

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
      <View ref={tabBarRef} style={wrapStyle}>
        {ingredientItems.map((item, index) => {
          const color = item.focused ? colors.BLACK : colors.INACTIVE;
          return (
            <TabBarItem
              key={item.key}
              showDividerRight={index !== ingredientItems.length - 1}
              onPress={() => {
                if (!item.focused) item.go();
              }}
              icon={item.icon(item.focused, color)}
              label={item.label}
              color={color}
            />
          );
        })}
      </View>
    );
  }

  // ✅ 레시피 영역이면 레시피 전용 탭바
  if (inRecipes) {
    return (
      <View ref={tabBarRef} style={wrapStyle}>
        {recipeItems.map((item, index) => {
          const color = item.focused ? colors.BLACK : colors.INACTIVE;
          return (
            <TabBarItem
              key={item.key}
              showDividerRight={index !== recipeItems.length - 1}
              onPress={() => {
                if (!item.focused) item.go();
              }}
              icon={item.icon(item.focused, color)}
              label={item.label}
              color={color}
            />
          );
        })}
      </View>
    );
  }

  // ✅ 기본(메인) 탭바
  return (
    <View ref={tabBarRef} style={wrapStyle}>
      {state.routes.map((route, index) => {
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
          <TabBarItem
            key={route.key}
            showDividerRight={index !== state.routes.length - 1}
            onPress={onPress}
            onLongPress={onLongPress}
            icon={
              options.tabBarIcon
                ? options.tabBarIcon({ focused, color, size: 20 })
                : null
            }
            label={label}
            color={color}
            rippleColor={colors.BLACK}
          />
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
});
