import { colors } from "@/constants";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SketchTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

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
