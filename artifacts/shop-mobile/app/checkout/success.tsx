import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

export default function OrderSuccessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { orderId, total } = useLocalSearchParams<{ orderId: string; total: string }>();

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const s = makeStyles(colors);

  return (
    <View style={[s.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={s.content}>
        {/* Animated checkmark */}
        <View style={[s.successIcon, { backgroundColor: colors.success + "22", borderColor: colors.success + "44" }]}>
          <Feather name="check-circle" size={72} color={colors.success} />
        </View>
        <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Order Placed!</Text>
        <Text style={[s.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Your order #{orderId} has been successfully placed. We'll contact you soon!
        </Text>

        {/* Order details card */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.cardRow}>
            <Text style={[s.cardLabel, { color: colors.mutedForeground }]}>Order ID</Text>
            <Text style={[s.cardValue, { color: colors.text, fontFamily: "Inter_700Bold" }]}>#{orderId}</Text>
          </View>
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <View style={s.cardRow}>
            <Text style={[s.cardLabel, { color: colors.mutedForeground }]}>Total Amount</Text>
            <Text style={[s.cardValue, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>৳{Number(total).toLocaleString()}</Text>
          </View>
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <View style={s.cardRow}>
            <Text style={[s.cardLabel, { color: colors.mutedForeground }]}>Status</Text>
            <View style={[s.statusBadge, { backgroundColor: colors.warning + "22" }]}>
              <Text style={[{ color: colors.warning, fontFamily: "Inter_600SemiBold", fontSize: 12 }]}>Pending Confirmation</Text>
            </View>
          </View>
        </View>

        {/* What's next */}
        <View style={[s.nextCard, { backgroundColor: colors.primary + "11", borderColor: colors.primary + "33" }]}>
          <Text style={[s.nextTitle, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>What happens next?</Text>
          {[
            "We'll verify your order and contact you",
            "Your items will be packed and shipped",
            "Track your order in real-time from the Orders tab",
          ].map((t, i) => (
            <View key={i} style={s.nextItem}>
              <View style={[s.nextDot, { backgroundColor: colors.primary }]}>
                <Text style={s.nextDotText}>{i + 1}</Text>
              </View>
              <Text style={[s.nextText, { color: colors.text, fontFamily: "Inter_400Regular" }]}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[s.btns, { paddingBottom: botPad + 16 }]}>
        <Pressable
          style={({ pressed }) => [s.trackBtn, { borderColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
          onPress={() => router.push("/(tabs)/orders")}
        >
          <Feather name="package" size={18} color={colors.primary} />
          <Text style={[s.trackText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>Track My Order</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.shopBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={[s.shopText, { fontFamily: "Inter_700Bold" }]}>Continue Shopping</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 40, gap: 20 },
    successIcon: { width: 130, height: 130, borderRadius: 65, borderWidth: 2, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 30 },
    subtitle: { fontSize: 15, textAlign: "center", lineHeight: 22 },
    card: { width: "100%", borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
    cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    cardLabel: { fontSize: 13 },
    cardValue: { fontSize: 15 },
    divider: { height: 1 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    nextCard: { width: "100%", borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
    nextTitle: { fontSize: 15, marginBottom: 4 },
    nextItem: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    nextDot: { width: 22, height: 22, borderRadius: 11, justifyContent: "center", alignItems: "center", marginTop: 2 },
    nextDotText: { fontSize: 11, color: "#000", fontFamily: "Inter_700Bold" },
    nextText: { flex: 1, fontSize: 13, lineHeight: 20 },
    btns: { paddingHorizontal: 24, gap: 10 },
    trackBtn: { height: 50, borderRadius: 14, borderWidth: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
    trackText: { fontSize: 15 },
    shopBtn: { height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    shopText: { fontSize: 17, color: "#000" },
  });
}
