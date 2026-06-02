import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

export default function TopUpSuccessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { amount, method } = useLocalSearchParams<{ amount: string; method: string }>();

  useEffect(() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }, []);

  const s = makeStyles(colors);

  return (
    <View style={[s.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={s.content}>
        <View style={[s.iconWrap, { backgroundColor: colors.success + "22", borderColor: colors.success + "44" }]}>
          <Feather name="check-circle" size={64} color={colors.success} />
        </View>
        <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Top Up Successful!</Text>
        <Text style={[s.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Your wallet has been credited. Your request is being verified by our team.
        </Text>
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InfoRow label="Amount" value={`৳${Number(amount).toLocaleString()}`} colors={colors} highlight />
          <InfoRow label="Method" value={(method ?? "bKash").charAt(0).toUpperCase() + (method ?? "bKash").slice(1)} colors={colors} />
          <InfoRow label="Status" value="Pending Verification" colors={colors} />
        </View>
      </View>
      <View style={[s.btns, { paddingBottom: botPad + 16 }]}>
        <Pressable style={({ pressed }) => [s.walletBtn, { borderColor: colors.primary, opacity: pressed ? 0.8 : 1 }]} onPress={() => router.replace("/profile/wallet")}>
          <Text style={[{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 15 }]}>View Wallet</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [s.homeBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]} onPress={() => router.replace("/(tabs)")}>
          <Text style={[{ color: "#000", fontFamily: "Inter_700Bold", fontSize: 16 }]}>Go to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

function InfoRow({ label, value, colors, highlight }: any) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 }}>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{label}</Text>
      <Text style={{ fontSize: 14, color: highlight ? colors.primary : colors.text, fontFamily: highlight ? "Inter_700Bold" : "Inter_500Medium" }}>{value}</Text>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 40, gap: 20 },
    iconWrap: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 28 },
    subtitle: { fontSize: 15, textAlign: "center", lineHeight: 22 },
    card: { width: "100%", borderRadius: 16, borderWidth: 1, padding: 16 },
    btns: { paddingHorizontal: 24, gap: 10 },
    walletBtn: { height: 50, borderRadius: 14, borderWidth: 2, alignItems: "center", justifyContent: "center" },
    homeBtn: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  });
}
