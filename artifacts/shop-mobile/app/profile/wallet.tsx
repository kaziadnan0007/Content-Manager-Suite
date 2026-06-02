import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { LinearGradient } from "expo-linear-gradient";

const TRANSACTIONS = [
  { id: 1, type: "credit", label: "Top Up via bKash", amount: 500, date: "Today, 2:30 PM" },
  { id: 2, type: "debit", label: "Order #1041 Payment", amount: -1200, date: "Yesterday" },
  { id: 3, type: "credit", label: "Cashback Reward", amount: 50, date: "2 days ago" },
  { id: 4, type: "credit", label: "Top Up via Rocket", amount: 2000, date: "1 week ago" },
  { id: 5, type: "debit", label: "Order #1033 Payment", amount: -750, date: "1 week ago" },
];

export default function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [balance] = useState(600);

  const s = makeStyles(colors);

  return (
    <ScrollView style={[s.container]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[s.header, { paddingTop: topPad + 8 }]}>
        <Pressable style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>My Wallet</Text>
      </View>

      {/* Balance card */}
      <LinearGradient colors={["#00C8FF", "#0052FF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.balanceCard}>
        <Text style={[s.balanceLabel, { fontFamily: "Inter_500Medium" }]}>Available Balance</Text>
        <Text style={[s.balanceAmount, { fontFamily: "Inter_700Bold" }]}>৳{balance.toLocaleString()}</Text>
        <View style={s.cardActions}>
          <Pressable style={[s.cardBtn, { backgroundColor: "#FFFFFF33" }]} onPress={() => router.push("/profile/add-money")}>
            <Feather name="plus" size={20} color="#fff" />
            <Text style={[s.cardBtnText, { fontFamily: "Inter_600SemiBold" }]}>Add Money</Text>
          </Pressable>
          <Pressable style={[s.cardBtn, { backgroundColor: "#FFFFFF33" }]}>
            <Feather name="send" size={20} color="#fff" />
            <Text style={[s.cardBtnText, { fontFamily: "Inter_600SemiBold" }]}>Transfer</Text>
          </Pressable>
        </View>
      </LinearGradient>

      {/* Stats row */}
      <View style={s.statsRow}>
        {[
          { label: "Total Spent", value: "৳1,950", icon: "trending-down", color: colors.destructive },
          { label: "Total Added", value: "৳2,550", icon: "trending-up", color: colors.success },
          { label: "Cashback", value: "৳50", icon: "gift", color: colors.warning },
        ].map(({ label, value, icon, color }) => (
          <View key={label} style={[s.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name={icon as any} size={18} color={color} />
            <Text style={[s.statVal, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{value}</Text>
            <Text style={[s.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Transactions */}
      <View style={s.section}>
        <Text style={[s.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Recent Transactions</Text>
        <View style={[s.txList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {TRANSACTIONS.map((tx, i) => (
            <React.Fragment key={tx.id}>
              <View style={s.txItem}>
                <View style={[s.txIcon, { backgroundColor: tx.type === "credit" ? colors.success + "22" : colors.destructive + "22" }]}>
                  <Feather name={tx.type === "credit" ? "arrow-down-left" : "arrow-up-right"} size={18} color={tx.type === "credit" ? colors.success : colors.destructive} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.txLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}>{tx.label}</Text>
                  <Text style={[s.txDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{tx.date}</Text>
                </View>
                <Text style={[s.txAmount, { color: tx.type === "credit" ? colors.success : colors.destructive, fontFamily: "Inter_700Bold" }]}>
                  {tx.type === "credit" ? "+" : ""}৳{Math.abs(tx.amount).toLocaleString()}
                </Text>
              </View>
              {i < TRANSACTIONS.length - 1 && <View style={[s.divider, { backgroundColor: colors.border }]} />}
            </React.Fragment>
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
    balanceCard: { marginHorizontal: 16, borderRadius: 20, padding: 24, gap: 8, marginBottom: 16 },
    balanceLabel: { color: "#FFFFFFCC", fontSize: 14 },
    balanceAmount: { color: "#fff", fontSize: 40 },
    cardActions: { flexDirection: "row", gap: 12, marginTop: 8 },
    cardBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 44, borderRadius: 12 },
    cardBtnText: { color: "#fff", fontSize: 14 },
    statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 16 },
    statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: "center", gap: 4 },
    statVal: { fontSize: 14 },
    statLabel: { fontSize: 10, textAlign: "center" },
    section: { paddingHorizontal: 16 },
    sectionTitle: { fontSize: 16, marginBottom: 10 },
    txList: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
    txItem: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
    txIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    txLabel: { fontSize: 14 },
    txDate: { fontSize: 12, marginTop: 2 },
    txAmount: { fontSize: 15 },
    divider: { height: 1, marginLeft: 70 },
  });
}
