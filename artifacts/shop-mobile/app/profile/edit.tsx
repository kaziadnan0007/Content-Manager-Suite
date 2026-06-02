import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";

const COLORS = ["#00D4FF","#3B82F6","#A855F7","#EC4899","#F97316","#22C55E"];

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor ?? COLORS[0]);
  const [saved, setSaved] = useState(false);

  const initials = name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleSave = async () => {
    await updateProfile({ name: name.trim(), email: email.trim(), city: city.trim(), avatarColor });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const s = makeStyles(colors);
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={[s.container]} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={[s.header, { paddingTop: topPad + 8 }]}>
          <Pressable style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Your Profile</Text>
          <Pressable onPress={handleSave}>
            <Text style={[s.saveText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>{saved ? "Saved!" : "Save"}</Text>
          </Pressable>
        </View>
        <View style={s.content}>
          <View style={s.avatarSection}>
            <View style={[s.avatar, { backgroundColor: avatarColor }]}>
              <Text style={[s.avatarText, { fontFamily: "Inter_700Bold" }]}>{initials || "AG"}</Text>
            </View>
            <View style={s.colorRow}>
              {COLORS.map((c) => (
                <Pressable key={c} onPress={() => setAvatarColor(c)}
                  style={[s.colorDot, { backgroundColor: c, borderWidth: avatarColor === c ? 3 : 0, borderColor: colors.text }]} />
              ))}
            </View>
          </View>
          <View style={s.form}>
            <Field label="Full Name" value={name} onChange={setName} colors={colors} />
            <Field label="Email" value={email} onChange={setEmail} colors={colors} keyboardType="email-address" />
            <Field label="City" value={city} onChange={setCity} colors={colors} />
            <View style={[s.phoneRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="phone" size={16} color={colors.mutedForeground} />
              <Text style={[s.phoneText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{user?.phone}</Text>
              <View style={[s.verBadge, { backgroundColor: colors.success + "22" }]}>
                <Text style={[{ color: colors.success, fontSize: 11, fontFamily: "Inter_600SemiBold" }]}>Verified</Text>
              </View>
            </View>
          </View>
          <Pressable style={({ pressed }) => [s.btn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]} onPress={handleSave}>
            <Text style={[s.btnText, { fontFamily: "Inter_700Bold" }]}>{saved ? "Profile Saved!" : "Save Changes"}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChange, colors, keyboardType }: any) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.text }}>{label}</Text>
      <TextInput style={{ height: 48, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, fontSize: 14, color: colors.text, backgroundColor: colors.card, fontFamily: "Inter_400Regular" }}
        value={value} onChangeText={onChange} placeholder={`Enter ${label.toLowerCase()}`} placeholderTextColor={colors.mutedForeground} keyboardType={keyboardType ?? "default"} />
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center" },
    title: { flex: 1, fontSize: 20 },
    saveText: { fontSize: 15 },
    content: { padding: 16, gap: 20 },
    avatarSection: { alignItems: "center", gap: 14 },
    avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
    avatarText: { fontSize: 28, color: "#fff" },
    colorRow: { flexDirection: "row", gap: 10 },
    colorDot: { width: 32, height: 32, borderRadius: 16 },
    form: { gap: 14 },
    phoneRow: { flexDirection: "row", alignItems: "center", gap: 10, height: 48, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14 },
    phoneText: { flex: 1, fontSize: 14 },
    verBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    btn: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    btnText: { fontSize: 17, color: "#000" },
  });
}
