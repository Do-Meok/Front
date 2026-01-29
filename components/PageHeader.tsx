import React from "react";
import { StyleSheet, Text, View } from "react-native";

const SIDE_WIDTH = 40;

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  leftChild?: React.ReactNode;
  rightChild?: React.ReactNode;
};

export default function PageHeader({
  title,
  leftChild,
  rightChild,
}: PageHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.sideLeft}>{leftChild}</View>
      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.sideRight}>{rightChild}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideLeft: {
    minWidth: SIDE_WIDTH,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  sideRight: {
    minWidth: SIDE_WIDTH,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
});
