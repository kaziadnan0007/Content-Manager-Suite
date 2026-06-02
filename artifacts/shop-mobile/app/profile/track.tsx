import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";

const STATUS_COLOR: Record<string, string> = {
  pending: "#FFB300", processing: "#3B82F6", shipped: "#00C8FF", delivered: "#00C896", cancelled: "#FF3355",
};

export default function TrackOrderScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { user } = useAuth();
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  const handleTrack = async () => {
    if (!orderId.trim() || !phone.trim()) { setError("Enter both Order ID and phone number"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/orders/track?orderId=${orderId.trim()}&phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Order not found"); return; }
      setOrder(data);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const s = makeStyles(colors);
  const statusColor = order ? (STATUS_COLOR[order.status] ?? colors.mutedForeground) : colors.primary;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={[s.container, { backgroundColor: colors.background }]} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={[s.header, { paddingTop: topPad + 8 }]}>
          <Pressable style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Track Order</Text>
        </View>

        <View style={s.content}>
          <View style={[s.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.formTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Enter Order Details</Text>
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.text }}>Order ID</Text>
              <TextInput style={[s.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                value={orderId} onChangeText={(t) => { setOrderId(t); setError(""); setOrder(null); }}
                placeholder="e.g. 1042" placeholderTextColor={colors.mutedForeground} keyboardType="number-pad" />
            </View>
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.text }}>Phone Number</Text>
              <TextInput style={[s.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                value={phone} onChangeText={(t) => { setPhone(t); setError(""); setOrder(null); }}
                placeholder="01XXXXXXXXX" placeholderTextColor={colors.mutedForeground} keyboardType="phone-pad" />
            </View>
            {!!error && <Text style={{ color: colors.destructive, fontSize: 13 }}>{error}</Text>}
            <Pressable style={({ pressed }) => [s.btn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]} onPress={handleTrack} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" /> : (
                <>
                  <Feather name="search" size={18} color="#000" />
                  <Text style={[s.btnText, { fontFamily: "Inter_700Bold" }]}>Track My Order</Text>
                </>
              )}
            </Pressable>
          </View>

          {order && (
            <View style={[s.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[s.statusBanner, { backgroundColor: statusColor + "22" }]}>
                <Feather name="package" size={32} color={statusColor} />
                <View>
                  <Text style={[s.statusText, { color: statusColor, fontFamily: "Inter_700Bold" }]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                  <Text style={[{ color: colors.mutedForeground, fontSize: 12 }]}>Order #{order.id}</Text>
                </View>
              </View>
              {[
                { label: "Customer", value: order.customerName },
                { label: "Phone", value: order.customerPhone },
                { label: "Address", value: order.customerAddress ?? "—" },
                { label: "Payment", value: order.paymentMethod },
                { label: "Total", value: `৳${Number(order.total).toLocaleString()}` },
                { label: "Date", value: new Date(order.createdAt).toLocaleDateString("en-BD") },
              ].map(({ label, value }) => (
                <View key={label} style={s.infoRow}>
                  <Text style={[{ color: colors.mutedForeground, fontSize: 13 }]}>{label}</Text>
                  <Text style={[{ color: colors.text, fontSize: 13, fontFamily: "Inter_500Medium" }]}>{value}</Text>
                </View>
              ))}
              <Pressable style={({ pressed }) => [s.detailBtn, { borderColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
                onPress={() => router.push(`/order/${order.id}`)}>
                <Text style={[{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 14 }]}>View Full Details</Text>
                <Feather name="arrow-right" size={14} color={colors.primary} />
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center" },
    title: { flex: 1, fontSize: 20 },
    content: { paddingHorizontal: 16, gap: 16 },
    form: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
    formTitle: { fontSize: 16, marginBottom: 4 },
    input: { height: 48, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
    btn: { height: 52, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
    btnText: { fontSize: 16, color: "#000" },
    resultCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
    statusBanner: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
    statusText: { fontSize: 18 },
    infoRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#1A2D4233" },
    detailBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, margin: 16, height: 44, borderRadius: 12, borderWidth: 2 },
  });
}
