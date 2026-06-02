import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";

export default function VerifyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { phone, demoCode } = useLocalSearchParams<{ phone: string; demoCode: string }>();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((x) => x - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const fullCode = code.join("");

  const handleChange = (val: string, idx: number) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[idx] = digit;
    setCode(next);
    setError("");
    if (digit && idx < 5) inputs.current[idx + 1]?.focus();
    if (!digit && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (fullCode.length !== 6) { setError("Enter all 6 digits"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid OTP");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({ pathname: "/auth/register", params: { phone } });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await fetch(`${BASE_URL}/api/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      setResendTimer(60);
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch {}
  };

  const s = makeStyles(colors);

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <Pressable style={s.backBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={22} color={colors.text} />
      </Pressable>

      <View style={s.content}>
        <View style={[s.iconWrap, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
          <Feather name="message-circle" size={40} color={colors.primary} />
        </View>
        <Text style={[s.title, { color: colors.text }]}>Verify OTP</Text>
        <Text style={[s.subtitle, { color: colors.mutedForeground }]}>
          6-digit OTP sent to {phone}
        </Text>

        {!!demoCode && (
          <View style={[s.demoBox, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "44" }]}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={[s.demoText, { color: colors.primary }]}>Demo OTP: <Text style={{ fontFamily: "Inter_700Bold", letterSpacing: 4 }}>{demoCode}</Text></Text>
          </View>
        )}

        <View style={s.codeRow}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={(r) => { if (r) inputs.current[i] = r; }}
              style={[s.codeBox, {
                borderColor: digit ? colors.primary : error ? colors.destructive : colors.border,
                backgroundColor: colors.card,
                color: colors.text,
              }]}
              value={digit}
              onChangeText={(v) => handleChange(v, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              autoFocus={i === 0}
            />
          ))}
        </View>

        {!!error && <Text style={[s.errText, { color: colors.destructive }]}>{error}</Text>}

        <Pressable
          style={({ pressed }) => [s.btn, { backgroundColor: colors.primary, opacity: (loading || fullCode.length < 6) ? 0.6 : pressed ? 0.85 : 1 }]}
          onPress={handleVerify}
          disabled={loading || fullCode.length < 6}
        >
          {loading ? <ActivityIndicator color="#000" /> : (
            <Text style={[s.btnText, { fontFamily: "Inter_700Bold" }]}>Verify & Continue</Text>
          )}
        </Pressable>

        <Pressable onPress={handleResend} disabled={resendTimer > 0}>
          <Text style={[s.resendText, { color: resendTimer > 0 ? colors.mutedForeground : colors.primary }]}>
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
    backBtn: { padding: 8, marginLeft: -8, marginBottom: 8 },
    content: { flex: 1, paddingTop: 20, alignItems: "center" },
    iconWrap: { width: 80, height: 80, borderRadius: 22, borderWidth: 1, justifyContent: "center", alignItems: "center", marginBottom: 20 },
    title: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 8 },
    subtitle: { fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 20 },
    demoBox: { flexDirection: "row", gap: 8, alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
    demoText: { fontSize: 14, fontFamily: "Inter_500Medium" },
    codeRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    codeBox: { width: 46, height: 56, borderWidth: 2, borderRadius: 12, fontSize: 24, fontFamily: "Inter_700Bold" },
    errText: { fontSize: 13, marginBottom: 12 },
    btn: { width: "100%", height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 16 },
    btnText: { fontSize: 17, color: "#000" },
    resendText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  });
}
