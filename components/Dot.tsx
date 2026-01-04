import { StyleSheet, View } from "react-native";

export default function Dots({
  index,
  total,
}: {
  index: number;
  total: number;
}) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === index ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 999 },
  dotActive: { backgroundColor: "#111" },
  dotInactive: { backgroundColor: "#ddd" },
});
