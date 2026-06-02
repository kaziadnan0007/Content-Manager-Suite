import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

export default function NewPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!next || next.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (next !== confirm) { setError("Passwords don't match"); return; }
    await AsyncStorage.setItem("ag_pin", next);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSuccess(true);
    setTimeout(() => router.back(), 1500);
  };

  const s = makeStyles(colors);
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[s.container, { paddingTop: topPad }]}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View style={s.content}>
          <View style={[s.icon, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
            <Feather name="lock" size={36} color={colors.primary} />
          </View>
          <Text style={[s.title, { color: colors.text }]}>Change Password</Text>
          <Text style={[s.subtitle, { color: colors.mutedForeground }]}>Set a PIN to protect your account</Text>
          <View style={s.form}>
            <PasswordField label="Current PIN (if any)" value={current} onChange={setCurrent} colors={colors} />
            <PasswordField label="New PIN (6+ characters)" value={next} onChange={(t) => { setNext(t); setError(""); }} colors={colors} />
            <PasswordField label="Confirm New PIN" value={confirm} onChange={(t) => { setConfirm(t); setError(""); }} colors={colors} />
            {!!error && <Text style={{ color: colors.destructive, fontSize: 13 }}>{error}</Text>}
            {success && <Text style={{ color: colors.success, fontSize: 13 }}>Password updated successfully!</Text>}
            <Pressable style={({ pressed }) => [s.btn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]} onPress={handleSave}>
              <Text style={[s.btnText, { fontFamily: "Inter_700Bold" }]}>Save Password</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function PasswordField({ label, value, onChange, colors }: any) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.text }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, height: 50, paddingHorizontal: 14, backgroundColor: colors.card, gap: 8 }}>
        <TextInput style={{ flex: 1, fontSize: 15, color: colors.text, fontFamily: "Inter_400Regular" }} value={value} onChangeText={onChange} secureTextEntry={!show} placeholder="••••••" placeholderTextColor={colors.mutedForeground} />
        <Pressable onPress={() => setShow((s) => !s)}>
          <Feather name={show ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
    backBtn: { padding: 8, marginLeft: -8, marginBottom: 8 },
    content: { flex: 1, paddingTop: 20 },
    icon: { width: 72, height: 72, borderRadius: 20, borderWidth: 1, justifyContent: "center", alignItems: "center", marginBottom: 16 },
    title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 6 },
    subtitle: { fontSize: 14, marginBottom: 28 },
    form: { gap: 14 },
    btn: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 8 },
    btnText: { fontSize: 17, color: "#000" },
  });
}
