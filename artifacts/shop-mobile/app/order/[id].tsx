import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];
const STATUS_COLOR: Record<string, string> = {
  pending: "#FFB300", processing: "#3B82F6", shipped: "#00C8FF", delivered: "#00C896", cancelled: "#FF3355",
};

export default function OrderDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  const fetchOrder = async () => {
    if (!phone.trim() || !id) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/orders/track?orderId=${id}&phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Order not found"); return; }
      setOrder(data);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const s = makeStyles(colors);
  const stepIdx = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <ScrollView style={[s.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={[s.header, { paddingTop: topPad + 8 }]}>
        <Pressable style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Track Order #{id}</Text>
      </View>

      <View style={s.content}>
        {!order && (
          <View style={[s.lookupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Verify your identity</Text>
            <Text style={[s.hint, { color: colors.mutedForeground }]}>Enter the phone number used for this order</Text>
            <TextInput
              style={[s.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background, fontFamily: "Inter_400Regular" }]}
              value={phone} onChangeText={setPhone} placeholder="01XXXXXXXXX" placeholderTextColor={colors.mutedForeground} keyboardType="phone-pad"
            />
            {!!error && <Text style={{ color: colors.destructive, fontSize: 13 }}>{error}</Text>}
            <Pressable style={({ pressed }) => [s.btn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]} onPress={fetchOrder} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={[s.btnText, { fontFamily: "Inter_700Bold" }]}>Track Order</Text>}
            </Pressable>
          </View>
        )}

        {order && (
          <>
            {/* Status */}
            <View style={[s.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={s.statusTop}>
                <View style={[s.statusIcon, { backgroundColor: (STATUS_COLOR[order.status] ?? colors.mutedForeground) + "22" }]}>
                  <Feather name="package" size={28} color={STATUS_COLOR[order.status] ?? colors.mutedForeground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.statusText, { color: STATUS_COLOR[order.status] ?? colors.text, fontFamily: "Inter_700Bold" }]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                  <Text style={[s.orderDate, { color: colors.mutedForeground }]}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                </View>
                <Text style={[s.totalAmt, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>৳{Number(order.total).toLocaleString()}</Text>
              </View>

              {order.status !== "cancelled" && (
                <View style={s.progressWrap}>
                  {STATUS_STEPS.map((st, i) => (
                    <React.Fragment key={st}>
                      <View style={s.progressStep}>
                        <View style={[s.progressDot, { backgroundColor: i <= stepIdx ? colors.primary : colors.border }]}>
                          {i < stepIdx && <Feather name="check" size={10} color="#000" />}
                        </View>
                        <Text style={[s.progressLabel, { color: i <= stepIdx ? colors.primary : colors.mutedForeground, fontFamily: i === stepIdx ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                          {st.charAt(0).toUpperCase() + st.slice(1)}
                        </Text>
                      </View>
                      {i < STATUS_STEPS.length - 1 && <View style={[s.progressLine, { backgroundColor: i < stepIdx ? colors.primary : colors.border }]} />}
                    </React.Fragment>
                  ))}
                </View>
              )}
            </View>

            {/* Delivery info */}
            <View style={[s.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[s.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Delivery Info</Text>
              <InfoRow label="Name" value={order.customerName} colors={colors} />
              <InfoRow label="Phone" value={order.customerPhone} colors={colors} />
              <InfoRow label="Address" value={order.customerAddress ?? "—"} colors={colors} />
              <InfoRow label="Payment" value={order.paymentMethod?.toUpperCase()} colors={colors} />
            </View>

            {/* Items */}
            <View style={[s.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[s.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Items ({order.items?.length})</Text>
              {order.items?.map((item: any, i: number) => (
                <View key={i} style={[s.itemRow, { borderTopColor: colors.border }]}>
                  <Text style={[s.itemName, { color: colors.text, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>{item.productName}</Text>
                  <Text style={[s.itemQty, { color: colors.mutedForeground }]}>×{item.quantity}</Text>
                  <Text style={[s.itemPrice, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>৳{(item.price * item.quantity).toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

function InfoRow({ label, value, colors }: any) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
      <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>{label}</Text>
      <Text style={{ fontSize: 13, color: colors.text, fontFamily: "Inter_500Medium", flex: 1, textAlign: "right" }}>{value}</Text>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 18 },
    content: { paddingHorizontal: 16, gap: 14 },
    lookupCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
    sectionTitle: { fontSize: 16 },
    hint: { fontSize: 13 },
    input: { height: 48, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, fontSize: 15 },
    btn: { height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    btnText: { fontSize: 16, color: "#000" },
    statusCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 16 },
    statusTop: { flexDirection: "row", alignItems: "center", gap: 12 },
    statusIcon: { width: 56, height: 56, borderRadius: 14, justifyContent: "center", alignItems: "center" },
    statusText: { fontSize: 16 },
    orderDate: { fontSize: 12, marginTop: 2 },
    totalAmt: { fontSize: 18 },
    progressWrap: { flexDirection: "row", alignItems: "center" },
    progressStep: { alignItems: "center", gap: 4 },
    progressDot: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    progressLabel: { fontSize: 10 },
    progressLine: { flex: 1, height: 2, marginHorizontal: 4, marginBottom: 14 },
    infoCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 4 },
    itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderTopWidth: 1, gap: 8 },
    itemName: { flex: 1, fontSize: 13 },
    itemQty: { fontSize: 12 },
    itemPrice: { fontSize: 13 },
  });
}
