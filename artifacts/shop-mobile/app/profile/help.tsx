import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useGetSettings } from "@workspace/api-client-react";

const FAQS = [
  { q: "How do I track my order?", a: "Go to the Orders tab, select your order, and tap 'Track Order' to see real-time delivery status." },
  { q: "What payment methods are accepted?", a: "We accept Cash on Delivery (COD), bKash, and Rocket. All payments are verified before dispatch." },
  { q: "How do I cancel or return an order?", a: "Contact us via WhatsApp within 24 hours of placing your order. Returns are accepted within 7 days for defective products." },
  { q: "Is my personal data safe?", a: "Yes! We never share your personal information with third parties. All data is encrypted and stored securely." },
  { q: "How long does delivery take?", a: "Dhaka: 1-2 business days. Outside Dhaka: 3-5 business days. Remote areas may take longer." },
  { q: "How do I use my wallet?", a: "Top up your AcholGatha wallet via bKash or Rocket and use it for instant checkout without entering payment details each time." },
  { q: "What if I receive a damaged product?", a: "Please take photos immediately and contact us via WhatsApp with your order ID. We'll arrange a replacement or refund." },
];

export default function HelpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { data: settings } = useGetSettings();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const s = makeStyles(colors);

  return (
    <ScrollView style={[s.container]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[s.header, { paddingTop: topPad + 8 }]}>
        <Pressable style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Help Center</Text>
      </View>

      {/* Contact options */}
      <View style={s.section}>
        <Text style={[s.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Contact Us</Text>
        <View style={[s.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { icon: "message-circle", label: "WhatsApp Support", sub: settings?.whatsappNumber ?? "01700000000", color: "#25D366" },
            { icon: "phone", label: "Call Us", sub: settings?.whatsappNumber ?? "01700000000", color: colors.primary },
            { icon: "mail", label: "Email Support", sub: "support@acholgatha.com", color: colors.secondary },
          ].map((c, i) => (
            <React.Fragment key={c.label}>
              <View style={s.contactItem}>
                <View style={[s.contactIcon, { backgroundColor: c.color + "22" }]}>
                  <Feather name={c.icon as any} size={20} color={c.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.contactLabel, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{c.label}</Text>
                  <Text style={[s.contactSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{c.sub}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </View>
              {i < 2 && <View style={[s.divider, { backgroundColor: colors.border }]} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* FAQs */}
      <View style={s.section}>
        <Text style={[s.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Frequently Asked Questions</Text>
        {FAQS.map((faq, i) => (
          <Pressable key={i} style={[s.faqItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setOpenFaq(openFaq === i ? null : i)}>
            <View style={s.faqQ}>
              <Text style={[s.faqQuestion, { color: colors.text, flex: 1, fontFamily: "Inter_600SemiBold" }]}>{faq.q}</Text>
              <Feather name={openFaq === i ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
            </View>
            {openFaq === i && <Text style={[s.faqAnswer, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{faq.a}</Text>}
          </Pressable>
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
    section: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
    sectionTitle: { fontSize: 16, marginBottom: 4 },
    contactCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
    contactItem: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
    contactIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    contactLabel: { fontSize: 14 },
    contactSub: { fontSize: 12, marginTop: 1 },
    divider: { height: 1, marginLeft: 70 },
    faqItem: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
    faqQ: { flexDirection: "row", alignItems: "center", gap: 8 },
    faqQuestion: { fontSize: 14, lineHeight: 20 },
    faqAnswer: { fontSize: 13, lineHeight: 20 },
  });
}
