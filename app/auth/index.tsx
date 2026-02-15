import AuthButton from "@/components/AuthButton";
import FoodThingLogo from "@/components/FoodThingLogo";
import { colors } from "@/constants";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.wrap}>
        <View style={styles.logoBox}>
          <FoodThingLogo size={44} />
        </View>
        <View style={styles.authCard}>
          <AuthButton />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  header: {
    height: 52,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  wrap: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 18,
    alignItems: "center",
  },
  logoBox: {
    alignItems: "center",
  },
  authCard: {
    width: "100%",
    maxWidth: 420,
    padding: 14,
    gap: 10,
  },
});
