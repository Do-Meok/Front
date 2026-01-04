import { colors } from "@/constants";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function FoodThingLogo({ size = 40 }: { size?: number }) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.logo, { fontSize: size }]}>FoodThing</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
  },
  logo: {
    fontWeight: "900",
    letterSpacing: -0.5,
    color: colors.BLACK,
  },
  subtitle: {
    textAlign: "center",
    color: colors.GRAY,
    marginTop: 6,
    marginBottom: 14,
  },
});
