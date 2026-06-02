import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";

export default function SignInScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async () => {
    const cleaned = phone.trim().replace(/\s/g, "");
    if (!cleaned) { setError("Please enter your phone number"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to send OTP"); return; }
      router.push({ pathname: "/auth/verify", params: { phone: cleaned, demoCode: data.demoCode ?? "" } });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const s = makeStyles(colors);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={[s.container]} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <Pressable style={[s.backBtn, { top: topPad + 8 }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>

        <View style={[s.content, { paddingTop: topPad + 70 }]}>
          <View style={[s.iconWrap, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
            <Feather name="smartphone" size={40} color={colors.primary} />
          </View>
          <Text style={[s.title, { color: colors.text }]}>Sign In</Text>
          <Text style={[s.subtitle, { color: colors.mutedForeground }]}>
            Enter your Bangladesh mobile number to receive an OTP
          </Text>

          <View style={s.form}>
            <Text style={[s.label, { color: colors.text }]}>Phone Number</Text>
            <View style={[s.inputWrap, { borderColor: error ? colors.destructive : colors.border, backgroundColor: colors.card }]}>
              <Text style={[s.prefix, { color: colors.mutedForeground }]}>+880</Text>
              <TextInput
                style={[s.input, { color: colors.text, fontFamily: "Inter_400Regular" }]}
                placeholder="1XXXXXXXXX"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(t) => { setPhone(t); setError(""); }}
                maxLength={11}
                returnKeyType="done"
                onSubmitEditing={handleSendOTP}
              />
              {phone.length > 0 && <Feather name="x" size={18} color={colors.mutedForeground} onPress={() => setPhone("")} />}
            </View>
            {!!error && <Text style={[s.errText, { color: colors.destructive }]}>{error}</Text>}

            <Pressable
              style={({ pressed }) => [s.btn, { backgroundColor: colors.primary, opacity: (loading || !phone) ? 0.6 : pressed ? 0.85 : 1 }]}
              onPress={handleSendOTP}
              disabled={loading || !phone}
            >
              {loading ? <ActivityIndicator color="#000" /> : (
                <>
                  <Text style={[s.btnText, { fontFamily: "Inter_700Bold" }]}>Send OTP</Text>
                  <Feather name="send" size={18} color="#000" />
                </>
              )}
            </Pressable>

            <View style={s.divider}>
              <View style={[s.divLine, { backgroundColor: colors.border }]} />
              <Text style={[s.divText, { color: colors.mutedForeground }]}>or</Text>
              <View style={[s.divLine, { backgroundColor: colors.border }]} />
            </View>

            <Pressable
              style={({ pressed }) => [s.btnOutline, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
              onPress={() => router.push("/auth/register")}
            >
              <Text style={[s.btnOutlineText, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                Create New Account
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[s.footer, { paddingBottom: botPad + 16 }]}>
          <Feather name="lock" size={14} color={colors.mutedForeground} />
          <Text style={[s.footerText, { color: colors.mutedForeground }]}>Your number is 100% secure. We never spam.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/hooks/useColors").useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    backBtn: { position: "absolute", left: 16, zIndex: 10, padding: 8 },
    content: { flex: 1, paddingHorizontal: 24 },
    iconWrap: { width: 80, height: 80, borderRadius: 22, borderWidth: 1, justifyContent: "center", alignItems: "center", marginBottom: 20 },
    title: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 8 },
    subtitle: { fontSize: 14, lineHeight: 22, marginBottom: 32 },
    form: { gap: 12 },
    label: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
    inputWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 14, height: 52, paddingHorizontal: 14, gap: 8 },
    prefix: { fontSize: 16, fontFamily: "Inter_500Medium" },
    input: { flex: 1, fontSize: 16, height: "100%" },
    errText: { fontSize: 13, marginTop: -4 },
    btn: { height: 54, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 8 },
    btnText: { fontSize: 17, color: "#000" },
    divider: { flexDirection: "row", alignItems: "center", gap: 12 },
    divLine: { flex: 1, height: 1 },
    divText: { fontSize: 13 },
    btnOutline: { height: 50, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
    btnOutlineText: { fontSize: 15 },
    footer: { flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
    footerText: { fontSize: 12 },
  });
}
