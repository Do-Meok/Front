import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";

export default function EllipsizedDesc({ text }: { text: string }) {
  const [isOverflow, setIsOverflow] = useState(false);

  return (
    <Text
      style={styles.desc}
      numberOfLines={2}
      ellipsizeMode="tail"
      onTextLayout={(e) => {
        const lines = e.nativeEvent.lines ?? [];
        if (lines.length > 2 && !isOverflow) setIsOverflow(true);
      }}
    >
      {text}
      {isOverflow && <Text style={styles.more}> ...</Text>}
    </Text>
  );
}

const styles = StyleSheet.create({
  desc: {
    color: "#444",
    lineHeight: 20,
  },
  more: {
    fontWeight: "800",
    color: "#111",
  },
});
