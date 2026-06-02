import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";
import { useGetSettings } from "@workspace/api-client-react";

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function AddMoneyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { data: settings } = useGetSettings();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"bkash" | "rocket">("bkash");
  const [txnId, setTxnId] = useState("");

  const handleTopUp = () => {
    if (!amount || !txnId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({ pathname: "/profile/topup-success", params: { amount, method } });
  };

  const s = makeStyles(colors);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={[s.container]} keyboardShouldPersistTaps="handled">
        <View style={[s.header, { paddingTop: topPad + 8 }]}>
          <Pressable style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Add Money</Text>
        </View>
        <View style={s.content}>
          <View style={[s.balanceBox, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "44" }]}>
            <Text style={[s.balLabel, { color: colors.mutedForeground }]}>Current Balance</Text>
            <Text style={[s.balAmount, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>৳600</Text>
          </View>

          <Text style={[s.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Quick Amounts</Text>
          <View style={s.quickGrid}>
            {QUICK_AMOUNTS.map((a) => (
              <Pressable key={a} style={[s.quickBtn, { borderColor: amount === String(a) ? colors.primary : colors.border, backgroundColor: amount === String(a) ? colors.primary + "15" : colors.card }]}
                onPress={() => setAmount(String(a))}>
                <Text style={[{ color: amount === String(a) ? colors.primary : colors.text, fontFamily: "Inter_600SemiBold" }]}>৳{a}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ gap: 6 }}>
            <Text style={[s.fieldLabel, { color: colors.text }]}>Custom Amount</Text>
            <TextInput style={[s.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, fontFamily: "Inter_400Regular" }]}
              value={amount} onChangeText={setAmount} placeholder="Enter amount (৳)" placeholderTextColor={colors.mutedForeground} keyboardType="number-pad" />
          </View>

          <Text style={[s.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Pay Via</Text>
          {[
            { id: "bkash" as const, label: "bKash", number: settings?.bkashNumber ?? "01700000000" },
            { id: "rocket" as const, label: "Rocket", number: settings?.rocketNumber ?? "01800000000" },
          ].map((m) => (
            <Pressable key={m.id} style={[s.methodCard, { backgroundColor: method === m.id ? colors.primary + "15" : colors.card, borderColor: method === m.id ? colors.primary : colors.border }]}
              onPress={() => setMethod(m.id)}>
              <View style={{ flex: 1 }}>
                <Text style={[{ color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{m.label}</Text>
                <Text style={[{ color: colors.mutedForeground, fontSize: 12 }]}>Send to: {m.number}</Text>
              </View>
              <View style={[s.radio, { borderColor: method === m.id ? colors.primary : colors.border }]}>
                {method === m.id && <View style={[s.radioDot, { backgroundColor: colors.primary }]} />}
              </View>
            </Pressable>
          ))}

          <View style={{ gap: 6 }}>
            <Text style={[s.fieldLabel, { color: colors.text }]}>Transaction ID *</Text>
            <TextInput style={[s.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, fontFamily: "Inter_400Regular" }]}
              value={txnId} onChangeText={setTxnId} placeholder="Enter TrxID from your app" placeholderTextColor={colors.mutedForeground} />
          </View>

          <Pressable style={({ pressed }) => [s.btn, { backgroundColor: (!amount || !txnId) ? colors.border : colors.primary, opacity: pressed ? 0.85 : 1 }]}
            onPress={handleTopUp} disabled={!amount || !txnId}>
            <Feather name="arrow-up-circle" size={20} color={(!amount || !txnId) ? colors.mutedForeground : "#000"} />
            <Text style={[s.btnText, { color: (!amount || !txnId) ? colors.mutedForeground : "#000", fontFamily: "Inter_700Bold" }]}>Top Up Wallet</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center" },
    title: { flex: 1, fontSize: 20 },
    content: { padding: 16, gap: 14 },
    balanceBox: { borderRadius: 16, borderWidth: 1, padding: 16, alignItems: "center", gap: 4 },
    balLabel: { fontSize: 13 },
    balAmount: { fontSize: 32 },
    sectionTitle: { fontSize: 15, marginBottom: -4 },
    quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    quickBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
    fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    input: { height: 48, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, fontSize: 15 },
    methodCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 12 },
    radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: "center", alignItems: "center" },
    radioDot: { width: 12, height: 12, borderRadius: 6 },
    btn: { height: 52, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
    btnText: { fontSize: 17 },
  });
}
