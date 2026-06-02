import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
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
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";

const COLORS = ["#00D4FF", "#3B82F6", "#A855F7", "#EC4899", "#F97316", "#22C55E"];

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { signIn } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [avatarColor, setAvatarColor] = useState(COLORS[0]);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) { setError("Please enter your full name"); return; }
    await signIn({ phone: phone ?? "", name: name.trim(), email: email.trim(), city: city.trim(), avatarColor });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/permissions/location");
  };

  const s = makeStyles(colors);

  const initials = name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={[s.container]} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <Pressable style={[s.backBtn, { top: topPad + 8 }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>

        <View style={[s.content, { paddingTop: topPad + 70 }]}>
          {/* Avatar preview */}
          <View style={[s.avatar, { backgroundColor: avatarColor }]}>
            <Text style={s.avatarText}>{initials || "AG"}</Text>
          </View>

          <Text style={[s.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[s.subtitle, { color: colors.mutedForeground }]}>
            Phone verified! Complete your profile.
          </Text>
          <View style={[s.phoneBadge, { backgroundColor: colors.success + "22", borderColor: colors.success + "44" }]}>
            <Feather name="check-circle" size={14} color={colors.success} />
            <Text style={[s.phoneText, { color: colors.success }]}>{phone}</Text>
          </View>

          <View style={s.form}>
            <Field label="Full Name *" value={name} onChangeText={(t) => { setName(t); setError(""); }}
              placeholder="e.g. Mohammad Rahim" colors={colors} />
            <Field label="Email (optional)" value={email} onChangeText={setEmail}
              placeholder="you@example.com" keyboardType="email-address" colors={colors} />
            <Field label="City (optional)" value={city} onChangeText={setCity}
              placeholder="e.g. Dhaka" colors={colors} />

            <Text style={[s.colorLabel, { color: colors.text }]}>Choose Profile Color</Text>
            <View style={s.colorRow}>
              {COLORS.map((c) => (
                <Pressable key={c} onPress={() => setAvatarColor(c)}
                  style={[s.colorDot, { backgroundColor: c, borderWidth: avatarColor === c ? 2 : 0, borderColor: colors.text }]} />
              ))}
            </View>

            {!!error && <Text style={[s.errText, { color: colors.destructive }]}>{error}</Text>}

            <Pressable
              style={({ pressed }) => [s.btn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
              onPress={handleCreate}
            >
              <Text style={[s.btnText, { fontFamily: "Inter_700Bold" }]}>Continue</Text>
              <Feather name="arrow-right" size={20} color="#000" />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, colors }: any) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.text }}>{label}</Text>
      <TextInput
        style={{
          height: 50, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
          paddingHorizontal: 14, fontSize: 15, color: colors.text, backgroundColor: colors.card,
          fontFamily: "Inter_400Regular",
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType ?? "default"}
      />
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    backBtn: { position: "absolute", left: 16, zIndex: 10, padding: 8 },
    content: { flex: 1, paddingHorizontal: 24 },
    avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 16 },
    avatarText: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
    title: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 8 },
    subtitle: { fontSize: 14, lineHeight: 22, marginBottom: 12 },
    phoneBadge: { flexDirection: "row", gap: 6, alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, alignSelf: "flex-start", marginBottom: 24 },
    phoneText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    form: { gap: 14 },
    colorLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    colorRow: { flexDirection: "row", gap: 10 },
    colorDot: { width: 32, height: 32, borderRadius: 16 },
    errText: { fontSize: 13 },
    btn: { height: 54, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 8 },
    btnText: { fontSize: 17, color: "#000" },
  });
}
