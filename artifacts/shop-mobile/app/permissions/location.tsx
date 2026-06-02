import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function LocationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: colors.secondary + "22", borderColor: colors.secondary + "44" }]}>
          <Feather name="map-pin" size={56} color={colors.secondary} />
        </View>
        <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Enable Location</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Allow AcholGatha to access your location so we can show you the best delivery options and local deals near you.
        </Text>
        <View style={styles.features}>
          {[
            { icon: "truck", text: "Get accurate delivery estimates" },
            { icon: "tag", text: "See deals near your area" },
            { icon: "navigation", text: "Easier address selection" },
          ].map(({ icon, text }) => (
            <View key={text} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: colors.secondary + "22" }]}>
                <Feather name={icon as any} size={18} color={colors.secondary} />
              </View>
              <Text style={[styles.featureText, { color: colors.text, fontFamily: "Inter_400Regular" }]}>{text}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={[styles.btns, { paddingBottom: botPad + 20 }]}>
        <Pressable
          style={({ pressed }) => [styles.btnPrimary, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.push("/permissions/notifications")}
        >
          <Feather name="map-pin" size={20} color="#000" />
          <Text style={[styles.btnPText, { fontFamily: "Inter_700Bold" }]}>Allow Location</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btnSkip, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => router.push("/permissions/notifications")}
        >
          <Text style={[styles.btnSkipText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Skip for now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  iconWrap: { width: 120, height: 120, borderRadius: 32, borderWidth: 1.5, justifyContent: "center", alignItems: "center", marginBottom: 28 },
  title: { fontSize: 28, marginBottom: 12, textAlign: "center" },
  subtitle: { fontSize: 15, textAlign: "center", lineHeight: 24, marginBottom: 28 },
  features: { gap: 14, width: "100%" },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  featureIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  featureText: { fontSize: 14, flex: 1 },
  btns: { paddingHorizontal: 24, gap: 12 },
  btnPrimary: { height: 54, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  btnPText: { fontSize: 17, color: "#000" },
  btnSkip: { alignItems: "center", padding: 10 },
  btnSkipText: { fontSize: 14 },
});
