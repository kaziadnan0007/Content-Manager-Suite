import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";

const LABEL_OPTIONS = ["Home", "Work", "Parents", "Other"];

export default function AddAddressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { updateProfile } = useAuth();
  const [label, setLabel] = useState("Home");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");

  const handleSave = async () => {
    const full = [street, area, city].filter(Boolean).join(", ");
    await updateProfile({ address: full, city });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const s = makeStyles(colors);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={[s.container]} keyboardShouldPersistTaps="handled">
        <View style={[s.header, { paddingTop: topPad + 8 }]}>
          <Pressable style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Add Address</Text>
        </View>
        <View style={s.content}>
          <Text style={[s.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Address Label</Text>
          <View style={s.labelRow}>
            {LABEL_OPTIONS.map((l) => (
              <Pressable key={l} style={[s.labelOpt, { backgroundColor: label === l ? colors.primary : colors.card, borderColor: label === l ? colors.primary : colors.border }]}
                onPress={() => setLabel(l)}>
                <Text style={[{ color: label === l ? "#000" : colors.text, fontFamily: label === l ? "Inter_600SemiBold" : "Inter_400Regular", fontSize: 13 }]}>{l}</Text>
              </Pressable>
            ))}
          </View>
          <View style={s.form}>
            {[
              { label: "Street / House / Road", value: street, setter: setStreet, placeholder: "House 12, Road 3, Block B" },
              { label: "Area / Thana", value: area, setter: setArea, placeholder: "Gulshan, Banani, Dhanmondi..." },
              { label: "City / District", value: city, setter: setCity, placeholder: "Dhaka, Chittagong..." },
              { label: "ZIP Code (optional)", value: zip, setter: setZip, placeholder: "1212", keyboard: "number-pad" },
            ].map((f) => (
              <View key={f.label} style={{ gap: 6 }}>
                <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.text }}>{f.label}</Text>
                <TextInput
                  style={{ height: 48, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, fontSize: 14, color: colors.text, backgroundColor: colors.card, fontFamily: "Inter_400Regular" }}
                  value={f.value} onChangeText={f.setter} placeholder={f.placeholder} placeholderTextColor={colors.mutedForeground}
                  keyboardType={(f as any).keyboard ?? "default"}
                />
              </View>
            ))}
          </View>
          <Pressable style={({ pressed }) => [s.btn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]} onPress={handleSave}>
            <Feather name="map-pin" size={18} color="#000" />
            <Text style={[s.btnText, { fontFamily: "Inter_700Bold" }]}>Save Address</Text>
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
    content: { padding: 16, gap: 16 },
    sectionTitle: { fontSize: 16 },
    labelRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    labelOpt: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
    form: { gap: 14 },
    btn: { height: 52, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 4 },
    btnText: { fontSize: 17, color: "#000" },
  });
}
