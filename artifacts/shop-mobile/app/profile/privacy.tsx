import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const SECTIONS = [
  { title: "Information We Collect", content: "We collect information you provide directly: your name, phone number, email address, delivery addresses, and order history. We may also collect device information and usage data to improve your experience." },
  { title: "How We Use Your Information", content: "Your information is used to process orders, send order notifications, provide customer support, and improve our services. We use your phone number only for OTP verification and order updates." },
  { title: "Information Sharing", content: "We do not sell, trade, or share your personal information with third parties except delivery partners who need your address to fulfill orders. All partners are bound by confidentiality agreements." },
  { title: "Data Security", content: "We implement industry-standard security measures including encrypted data transmission (HTTPS), secure servers, and OTP-based phone verification. Your payment transactions are never stored on our servers." },
  { title: "SMS & Notifications", content: "By providing your phone number, you consent to receive order-related SMS notifications. You can opt out of promotional messages at any time from Settings." },
  { title: "Your Rights", content: "You have the right to access, update, or delete your personal data. Contact us via WhatsApp to exercise these rights. We will process your request within 7 business days." },
  { title: "Contact Us", content: "For privacy concerns, contact our Data Protection Officer at privacy@acholgatha.com or via WhatsApp." },
];

export default function PrivacyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const s = makeStyles(colors);

  return (
    <ScrollView style={[s.container]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[s.header, { paddingTop: topPad + 8 }]}>
        <Pressable style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Privacy Policy</Text>
      </View>
      <View style={s.content}>
        <View style={[s.topCard, { backgroundColor: colors.primary + "11", borderColor: colors.primary + "33" }]}>
          <Feather name="shield" size={24} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[s.topTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Your Privacy Matters</Text>
            <Text style={[s.topSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Last updated: January 2025</Text>
          </View>
        </View>
        {SECTIONS.map((sec) => (
          <View key={sec.title} style={s.section}>
            <Text style={[s.secTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{sec.title}</Text>
            <Text style={[s.secContent, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{sec.content}</Text>
          </View>
        ))}
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
    content: { padding: 16, gap: 20 },
    topCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
    topTitle: { fontSize: 15 },
    topSub: { fontSize: 12, marginTop: 2 },
    section: { gap: 8 },
    secTitle: { fontSize: 15 },
    secContent: { fontSize: 14, lineHeight: 22 },
  });
}
