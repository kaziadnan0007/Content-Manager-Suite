import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useGetSettings } from "@workspace/api-client-react";

export default function PaymentMethodsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { data: settings } = useGetSettings();
  const [defaultMethod, setDefaultMethod] = useState("cod");

  const methods = [
    { id: "cod", label: "Cash on Delivery", icon: "dollar-sign", sub: "Pay when your order arrives", color: colors.success },
    { id: "bkash", label: "bKash", icon: "smartphone", sub: settings?.bkashNumber ?? "01700000000", color: "#E2136E" },
    { id: "rocket", label: "Rocket", icon: "zap", sub: settings?.rocketNumber ?? "01800000000", color: "#7B2FBE" },
  ];

  const s = makeStyles(colors);

  return (
    <ScrollView style={[s.container]} showsVerticalScrollIndicator={false}>
      <View style={[s.header, { paddingTop: topPad + 8 }]}>
        <Pressable style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Payment Methods</Text>
      </View>
      <View style={s.content}>
        <Text style={[s.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Available Methods</Text>
        {methods.map((m) => (
          <Pressable key={m.id} style={[s.card, { backgroundColor: colors.card, borderColor: defaultMethod === m.id ? colors.primary : colors.border }]}
            onPress={() => setDefaultMethod(m.id)}>
            <View style={[s.methodIcon, { backgroundColor: m.color + "22" }]}>
              <Feather name={m.icon as any} size={22} color={m.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.methodName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{m.label}</Text>
              <Text style={[s.methodSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{m.sub}</Text>
            </View>
            {defaultMethod === m.id && (
              <View style={[s.defaultBadge, { backgroundColor: colors.primary + "22" }]}>
                <Text style={[{ color: colors.primary, fontSize: 11, fontFamily: "Inter_600SemiBold" }]}>Default</Text>
              </View>
            )}
          </Pressable>
        ))}
        <View style={[s.infoBox, { backgroundColor: colors.primary + "11", borderColor: colors.primary + "33" }]}>
          <Feather name="info" size={16} color={colors.primary} />
          <Text style={[s.infoText, { color: colors.text, fontFamily: "Inter_400Regular" }]}>
            For bKash & Rocket payments, send money to the merchant number during checkout and enter the transaction ID.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center" },
    title: { flex: 1, fontSize: 20 },
    content: { padding: 16, gap: 12 },
    sectionTitle: { fontSize: 16, marginBottom: 4 },
    card: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 12 },
    methodIcon: { width: 48, height: 48, borderRadius: 13, justifyContent: "center", alignItems: "center" },
    methodName: { fontSize: 15 },
    methodSub: { fontSize: 12, marginTop: 2 },
    defaultBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    infoBox: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderRadius: 12, borderWidth: 1, padding: 14 },
    infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  });
}
