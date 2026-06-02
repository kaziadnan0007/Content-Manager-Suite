import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [notifOrders, setNotifOrders] = useState(true);
  const [notifDeals, setNotifDeals] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [newsletter, setNewsletter] = useState(true);

  const s = makeStyles(colors);
  const settingsGroups = [
    {
      title: "Notifications",
      items: [
        { label: "Order Updates", sub: "Get notified about your orders", value: notifOrders, onChange: setNotifOrders },
        { label: "Flash Deals", sub: "Daily deal alerts and flash sales", value: notifDeals, onChange: setNotifDeals },
        { label: "Promotions", sub: "Special offers and discount codes", value: notifPromo, onChange: setNotifPromo },
        { label: "Newsletter", sub: "Weekly product recommendations", value: newsletter, onChange: setNewsletter },
      ],
    },
    {
      title: "Security",
      items: [
        { label: "Biometric Login", sub: "Use fingerprint or Face ID", value: biometric, onChange: setBiometric },
      ],
    },
    {
      title: "Appearance",
      items: [
        { label: "Dark Mode", sub: "Switch to dark theme", value: darkMode, onChange: setDarkMode },
      ],
    },
  ];

  return (
    <ScrollView style={[s.container]} showsVerticalScrollIndicator={false}>
      <View style={[s.header, { paddingTop: topPad + 8 }]}>
        <Pressable style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Settings</Text>
      </View>
      {settingsGroups.map((group) => (
        <View key={group.title} style={s.group}>
          <Text style={[s.groupTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{group.title.toUpperCase()}</Text>
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {group.items.map((item, i) => (
              <React.Fragment key={item.label}>
                <View style={s.settingItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.settingLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}>{item.label}</Text>
                    <Text style={[s.settingSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.sub}</Text>
                  </View>
                  <Switch value={item.value} onValueChange={item.onChange} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#fff" />
                </View>
                {i < group.items.length - 1 && <View style={[s.divider, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}
          </View>
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center" },
    title: { flex: 1, fontSize: 20 },
    group: { paddingHorizontal: 16, paddingTop: 16 },
    groupTitle: { fontSize: 11, letterSpacing: 1, marginBottom: 6, marginLeft: 2 },
    card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
    settingItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
    settingLabel: { fontSize: 14 },
    settingSub: { fontSize: 12, marginTop: 1 },
    divider: { height: 1, marginLeft: 14 },
  });
}
