import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator, Image, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrdersContext";
import { useGetSettings, useCreateOrder } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";
const STEPS = ["Address", "Payment", "Review"] as const;

type PayMethod = "cod" | "bkash" | "rocket";

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const { data: settings } = useGetSettings();
  const createOrder = useCreateOrder();

  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [note, setNote] = useState("");
  const [payMethod, setPayMethod] = useState<PayMethod>("cod");
  const [payNumber, setPayNumber] = useState("");
  const [txnId, setTxnId] = useState("");
  const [otpStep, setOtpStep] = useState<"idle" | "sent" | "verified">("idle");
  const [otpCode, setOtpCode] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);

  const s = makeStyles(colors);

  const handleSendOtp = async () => {
    const p = phone.trim();
    if (!p) { setOtpError("Enter phone number"); return; }
    setSendingOtp(true);
    setOtpError("");
    try {
      const res = await fetch(`${BASE_URL}/api/otp/send`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: p }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.error ?? "Failed to send OTP"); return; }
      setOtpStep("sent");
      if (data.demoCode) setDemoCode(data.demoCode);
    } catch { setOtpError("Network error"); }
    finally { setSendingOtp(false); }
  };

  const handleVerifyOtp = async () => {
    if (otpInput.length !== 6) { setOtpError("Enter 6-digit OTP"); return; }
    try {
      const res = await fetch(`${BASE_URL}/api/otp/verify`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), code: otpInput }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.error ?? "Invalid OTP"); return; }
      setOtpStep("verified");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch { setOtpError("Network error"); }
  };

  const handlePlaceOrder = () => {
    createOrder.mutate({
      data: {
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        paymentMethod: payMethod,
        paymentNumber: payNumber || undefined,
        transactionId: txnId || undefined,
        note: note || undefined,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      },
    }, {
      onSuccess: (order) => {
        addOrder({
          orderId: order.id,
          phone,
          customerName: name,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
          paymentMethod: order.paymentMethod,
        });
        clearCart();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace({ pathname: "/checkout/success", params: { orderId: String(order.id), total: String(order.total) } });
      },
    });
  };

  if (items.length === 0 && step === 0) {
    return (
      <View style={[s.center, { backgroundColor: colors.background }]}>
        <Text style={[{ color: colors.text, fontFamily: "Inter_600SemiBold", fontSize: 18 }]}>Cart is empty</Text>
        <Pressable style={[s.btn, { backgroundColor: colors.primary }]} onPress={() => router.push("/(tabs)/search")}>
          <Text style={[s.btnText, { fontFamily: "Inter_700Bold" }]}>Shop Now</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[s.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={() => step > 0 ? setStep(step - 1) : router.back()}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <Text style={[s.headerTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Checkout</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Step indicator */}
        <View style={s.stepRow}>
          {STEPS.map((st, i) => (
            <React.Fragment key={st}>
              <View style={s.stepItem}>
                <View style={[s.stepDot, { backgroundColor: i <= step ? colors.primary : colors.border }]}>
                  {i < step ? <Feather name="check" size={12} color="#000" /> : <Text style={[s.stepNum, { color: i === step ? "#000" : colors.mutedForeground }]}>{i + 1}</Text>}
                </View>
                <Text style={[s.stepLabel, { color: i <= step ? colors.primary : colors.mutedForeground, fontFamily: i === step ? "Inter_600SemiBold" : "Inter_400Regular" }]}>{st}</Text>
              </View>
              {i < STEPS.length - 1 && <View style={[s.stepLine, { backgroundColor: i < step ? colors.primary : colors.border }]} />}
            </React.Fragment>
          ))}
        </View>

        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Step 0: Address */}
          {step === 0 && (
            <View style={s.stepContent}>
              <FormField label="Full Name *" value={name} onChange={setName} placeholder="Mohammad Rahim" colors={colors} />
              {/* Phone + OTP */}
              <View style={{ gap: 8 }}>
                <Text style={[s.fieldLabel, { color: colors.text }]}>Phone Number *</Text>
                <View style={s.phoneRow}>
                  <TextInput style={[s.input, s.phoneInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, fontFamily: "Inter_400Regular" }]}
                    value={phone} onChangeText={(t) => { setPhone(t); setOtpStep("idle"); setOtpError(""); }}
                    placeholder="01XXXXXXXXX" placeholderTextColor={colors.mutedForeground} keyboardType="phone-pad"
                    editable={otpStep !== "verified"} />
                  {otpStep === "verified" ? (
                    <View style={[s.verifiedBadge, { backgroundColor: colors.success + "22" }]}>
                      <Feather name="check-circle" size={16} color={colors.success} />
                    </View>
                  ) : (
                    <Pressable style={[s.otpSendBtn, { backgroundColor: colors.primary, opacity: sendingOtp ? 0.6 : 1 }]} onPress={handleSendOtp} disabled={sendingOtp}>
                      {sendingOtp ? <ActivityIndicator size="small" color="#000" /> : <Text style={[s.otpBtnText, { fontFamily: "Inter_600SemiBold" }]}>{otpStep === "sent" ? "Resend" : "OTP"}</Text>}
                    </Pressable>
                  )}
                </View>
                {otpStep === "sent" && (
                  <View style={[s.otpPanel, { backgroundColor: colors.primary + "11", borderColor: colors.primary + "44" }]}>
                    {!!demoCode && <Text style={[{ color: colors.primary, fontSize: 13, fontFamily: "Inter_600SemiBold" }]}>Demo OTP: {demoCode}</Text>}
                    <View style={s.phoneRow}>
                      <TextInput style={[s.input, s.phoneInput, { flex: 1, color: colors.text, borderColor: colors.border, backgroundColor: colors.card, fontFamily: "Inter_700Bold", letterSpacing: 4, textAlign: "center" }]}
                        value={otpInput} onChangeText={(t) => { setOtpInput(t.replace(/\D/g, "")); setOtpError(""); }}
                        placeholder="------" placeholderTextColor={colors.mutedForeground} keyboardType="number-pad" maxLength={6} />
                      <Pressable style={[s.otpSendBtn, { backgroundColor: colors.success }]} onPress={handleVerifyOtp}>
                        <Text style={[s.otpBtnText, { fontFamily: "Inter_600SemiBold" }]}>Verify</Text>
                      </Pressable>
                    </View>
                    {!!otpError && <Text style={{ color: colors.destructive, fontSize: 12 }}>{otpError}</Text>}
                  </View>
                )}
              </View>
              <FormField label="Delivery Address *" value={address} onChange={setAddress} placeholder="House, Road, Area, District" multiline colors={colors} />
              <FormField label="Order Note (optional)" value={note} onChange={setNote} placeholder="Any special instructions..." multiline colors={colors} />
            </View>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <View style={s.stepContent}>
              <Text style={[s.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Choose Payment</Text>
              {([
                { value: "cod", label: "Cash on Delivery", icon: "dollar-sign", sub: "Pay when your order arrives" },
                { value: "bkash", label: "bKash", icon: "smartphone", sub: settings?.bkashNumber ?? "" },
                { value: "rocket", label: "Rocket", icon: "zap", sub: settings?.rocketNumber ?? "" },
              ] as const).map((opt) => (
                <Pressable key={opt.value} style={[s.payOpt, { borderColor: payMethod === opt.value ? colors.primary : colors.border, backgroundColor: payMethod === opt.value ? colors.primary + "11" : colors.card }]}
                  onPress={() => setPayMethod(opt.value)}>
                  <View style={[s.payIcon, { backgroundColor: colors.primary + "22" }]}>
                    <Feather name={opt.icon as any} size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[{ color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{opt.label}</Text>
                    <Text style={[{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_400Regular" }]}>{opt.sub}</Text>
                  </View>
                  <View style={[s.radio, { borderColor: payMethod === opt.value ? colors.primary : colors.border }]}>
                    {payMethod === opt.value && <View style={[s.radioDot, { backgroundColor: colors.primary }]} />}
                  </View>
                </Pressable>
              ))}
              {payMethod !== "cod" && (
                <View style={[s.mobilePayPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <FormField label="Your Sender Number" value={payNumber} onChange={setPayNumber} placeholder="01XXXXXXXXX" colors={colors} keyboardType="phone-pad" />
                  <FormField label="Transaction ID" value={txnId} onChange={setTxnId} placeholder="e.g. 8KXX1234" colors={colors} />
                </View>
              )}
            </View>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <View style={s.stepContent}>
              <Text style={[s.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Order Summary</Text>
              {/* Items */}
              {items.map((item) => (
                <View key={item.productId} style={[s.reviewItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[s.reviewImg, { backgroundColor: colors.muted }]}>
                    {item.image && <Image source={{ uri: item.image }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[{ color: colors.text, fontFamily: "Inter_500Medium", fontSize: 13 }]} numberOfLines={2}>{item.name}</Text>
                    <Text style={[{ color: colors.mutedForeground, fontSize: 12 }]}>Qty: {item.quantity}</Text>
                    <Text style={[{ color: colors.primary, fontFamily: "Inter_700Bold" }]}>৳{(item.price * item.quantity).toLocaleString()}</Text>
                  </View>
                </View>
              ))}
              {/* Summary */}
              <View style={[s.summaryBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {[
                  { label: "Subtotal", value: `৳${totalPrice.toLocaleString()}` },
                  { label: "Delivery", value: "Calculated later" },
                  { label: "Payment", value: payMethod === "cod" ? "Cash on Delivery" : payMethod === "bkash" ? "bKash" : "Rocket" },
                  { label: "Phone", value: phone },
                ].map(({ label, value }) => (
                  <View key={label} style={s.summaryRow}>
                    <Text style={[{ color: colors.mutedForeground, fontSize: 13, fontFamily: "Inter_400Regular" }]}>{label}</Text>
                    <Text style={[{ color: colors.text, fontSize: 13, fontFamily: "Inter_500Medium" }]}>{value}</Text>
                  </View>
                ))}
                <View style={[s.summaryRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 4 }]}>
                  <Text style={[{ color: colors.text, fontSize: 16, fontFamily: "Inter_700Bold" }]}>Total</Text>
                  <Text style={[{ color: colors.primary, fontSize: 20, fontFamily: "Inter_700Bold" }]}>৳{totalPrice.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Bottom action */}
        <View style={[s.bottomAction, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: botPad + 12 }]}>
          {step === 0 && (
            <Pressable
              style={({ pressed }) => [s.btn, { backgroundColor: otpStep !== "verified" ? colors.border : colors.primary, opacity: pressed ? 0.85 : 1 }]}
              onPress={() => {
                if (otpStep !== "verified") { setOtpError("Please verify your phone number first"); return; }
                if (!name.trim() || !address.trim()) { return; }
                setStep(1);
              }}
              disabled={otpStep !== "verified"}
            >
              <Text style={[s.btnText, { color: otpStep !== "verified" ? colors.mutedForeground : "#000", fontFamily: "Inter_700Bold" }]}>
                {otpStep !== "verified" ? "Verify Phone to Continue" : "Continue to Payment"}
              </Text>
              <Feather name="arrow-right" size={18} color={otpStep !== "verified" ? colors.mutedForeground : "#000"} />
            </Pressable>
          )}
          {step === 1 && (
            <Pressable style={({ pressed }) => [s.btn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]} onPress={() => setStep(2)}>
              <Text style={[s.btnText, { fontFamily: "Inter_700Bold" }]}>Review Order</Text>
              <Feather name="arrow-right" size={18} color="#000" />
            </Pressable>
          )}
          {step === 2 && (
            <Pressable
              style={({ pressed }) => [s.btn, { backgroundColor: colors.primary, opacity: createOrder.isPending ? 0.6 : pressed ? 0.85 : 1 }]}
              onPress={handlePlaceOrder} disabled={createOrder.isPending}
            >
              {createOrder.isPending ? <ActivityIndicator color="#000" /> : (
                <>
                  <Feather name="shield" size={18} color="#000" />
                  <Text style={[s.btnText, { fontFamily: "Inter_700Bold" }]}>Place Order — ৳{totalPrice.toLocaleString()}</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function FormField({ label, value, onChange, placeholder, multiline, colors, keyboardType }: any) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.text }}>{label}</Text>
      <TextInput
        style={{ borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.text, backgroundColor: colors.card, fontFamily: "Inter_400Regular", ...(multiline ? { height: 80, textAlignVertical: "top" } : { height: 48 }) }}
        value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.mutedForeground}
        multiline={!!multiline} keyboardType={keyboardType ?? "default"}
      />
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
    headerTitle: { fontSize: 18 },
    stepRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, marginBottom: 8 },
    stepItem: { alignItems: "center", gap: 4 },
    stepDot: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
    stepNum: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    stepLabel: { fontSize: 11 },
    stepLine: { flex: 1, height: 2, marginHorizontal: 6, marginBottom: 12 },
    scroll: { flex: 1, paddingHorizontal: 16 },
    stepContent: { gap: 14, paddingTop: 8 },
    fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    phoneRow: { flexDirection: "row", gap: 8, alignItems: "center" },
    input: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, fontSize: 14, height: 48 },
    phoneInput: { flex: 1 },
    verifiedBadge: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    otpSendBtn: { height: 48, paddingHorizontal: 14, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    otpBtnText: { fontSize: 13, color: "#000" },
    otpPanel: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 8 },
    sectionTitle: { fontSize: 17, marginBottom: 4 },
    payOpt: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 12 },
    payIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: "center", alignItems: "center" },
    radioDot: { width: 12, height: 12, borderRadius: 6 },
    mobilePayPanel: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
    reviewItem: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 10, gap: 10, alignItems: "center" },
    reviewImg: { width: 56, height: 56, borderRadius: 8, overflow: "hidden" },
    summaryBox: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    bottomAction: { padding: 16, borderTopWidth: 1 },
    btn: { height: 54, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
    btnText: { fontSize: 16, color: "#000" },
  });
}
