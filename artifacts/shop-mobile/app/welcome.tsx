import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero gradient */}
      <LinearGradient
        colors={["#00D4FF22", "#0052FF11", "transparent"]}
        style={styles.heroGrad}
      />

      {/* Top logo area */}
      <View style={[styles.topSection, { paddingTop: topPad + 40 }]}>
        <View style={[styles.logoWrap, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
          <Feather name="shopping-bag" size={52} color={colors.primary} />
        </View>
        <Text style={[styles.brand, { color: colors.text, fontFamily: "Inter_700Bold" }]}>AcholGatha</Text>
        <Text style={[styles.tagline, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Bangladesh's #1 Online Shop
        </Text>

        {/* Feature pills */}
        <View style={styles.pills}>
          {["Free Delivery", "10M+ Products", "Secure Pay"].map((t) => (
            <View key={t} style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="check-circle" size={12} color={colors.primary} />
              <Text style={[styles.pillText, { color: colors.text, fontFamily: "Inter_500Medium" }]}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom CTA */}
      <View style={[styles.bottom, { paddingBottom: botPad + 24 }]}>
        <Pressable
          style={({ pressed }) => [styles.btnPrimary, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.push("/onboarding")}
        >
          <Text style={[styles.btnPrimaryText, { fontFamily: "Inter_700Bold" }]}>Get Started</Text>
          <Feather name="arrow-right" size={20} color="#000" />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btnSecondary, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
          onPress={() => router.push("/auth/sign-in")}
        >
          <Text style={[styles.btnSecText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            Already have an account? <Text style={{ color: colors.primary }}>Sign in</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroGrad: { position: "absolute", top: 0, left: 0, right: 0, height: height * 0.5 },
  topSection: { flex: 1, alignItems: "center", paddingHorizontal: 32 },
  logoWrap: { width: 110, height: 110, borderRadius: 28, borderWidth: 1, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  brand: { fontSize: 36, letterSpacing: -1, marginBottom: 8 },
  tagline: { fontSize: 15, textAlign: "center", marginBottom: 28 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  pill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  pillText: { fontSize: 12 },
  bottom: { paddingHorizontal: 24, gap: 12 },
  btnPrimary: { height: 56, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  btnPrimaryText: { fontSize: 18, color: "#000" },
  btnSecondary: { height: 48, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  btnSecText: { fontSize: 14 },
});
