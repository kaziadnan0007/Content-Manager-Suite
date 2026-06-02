import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

const REFERRAL_CODE = "ACHOL2025";

export default function InviteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const s = makeStyles(colors);

  return (
    <ScrollView style={[s.container]} showsVerticalScrollIndicator={false}>
      <View style={[s.header, { paddingTop: topPad + 8 }]}>
        <Pressable style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Invite Friends</Text>
      </View>

      <View style={s.content}>
        <View style={[s.heroBanner, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "33" }]}>
          <Feather name="gift" size={52} color={colors.primary} />
          <Text style={[s.heroTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Refer & Earn ৳50!</Text>
          <Text style={[s.heroSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Invite friends to AcholGatha. You get ৳50 wallet credit when they place their first order!
          </Text>
        </View>

        <View style={s.steps}>
          {[
            { step: "1", text: "Share your unique referral code with friends" },
            { step: "2", text: "Your friend signs up and places their first order" },
            { step: "3", text: "You both get ৳50 wallet credit instantly!" },
          ].map(({ step, text }) => (
            <View key={step} style={s.stepRow}>
              <View style={[s.stepDot, { backgroundColor: colors.primary }]}>
                <Text style={[{ color: "#000", fontFamily: "Inter_700Bold", fontSize: 13 }]}>{step}</Text>
              </View>
              <Text style={[s.stepText, { color: colors.text, fontFamily: "Inter_400Regular" }]}>{text}</Text>
            </View>
          ))}
        </View>

        <View style={[s.codeBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.codeLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Your Referral Code</Text>
          <Text style={[s.code, { color: colors.primary, fontFamily: "Inter_700Bold", letterSpacing: 4 }]}>{REFERRAL_CODE}</Text>
          <Pressable style={({ pressed }) => [s.copyBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]} onPress={handleCopy}>
            <Feather name={copied ? "check" : "copy"} size={16} color="#000" />
            <Text style={[{ color: "#000", fontFamily: "Inter_600SemiBold", fontSize: 14 }]}>{copied ? "Copied!" : "Copy Code"}</Text>
          </Pressable>
        </View>

        <View style={s.shareRow}>
          {[
            { label: "WhatsApp", icon: "message-circle", color: "#25D366" },
            { label: "Facebook", icon: "share-2", color: "#1877F2" },
            { label: "SMS", icon: "smartphone", color: colors.primary },
            { label: "More", icon: "more-horizontal", color: colors.mutedForeground },
          ].map(({ label, icon, color }) => (
            <Pressable key={label} style={s.shareBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <View style={[s.shareIcon, { backgroundColor: color + "22" }]}>
                <Feather name={icon as any} size={22} color={color} />
              </View>
              <Text style={[s.shareLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
            </Pressable>
          ))}
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
    content: { padding: 16, gap: 20, paddingBottom: 40 },
    heroBanner: { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: "center", gap: 10 },
    heroTitle: { fontSize: 24 },
    heroSub: { fontSize: 14, textAlign: "center", lineHeight: 22 },
    steps: { gap: 14 },
    stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
    stepDot: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", marginTop: 2 },
    stepText: { flex: 1, fontSize: 14, lineHeight: 20 },
    codeBox: { borderRadius: 16, borderWidth: 1.5, padding: 20, alignItems: "center", gap: 10 },
    codeLabel: { fontSize: 13 },
    code: { fontSize: 28 },
    copyBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
    shareRow: { flexDirection: "row", justifyContent: "space-around" },
    shareBtn: { alignItems: "center", gap: 6 },
    shareIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: "center", alignItems: "center" },
    shareLabel: { fontSize: 12 },
  });
}
