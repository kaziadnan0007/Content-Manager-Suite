import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Address { id: string; label: string; full: string; city: string; isDefault?: boolean; }

export default function AddressesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>(user?.address ? [
    { id: "1", label: "Home", full: user.address, city: user.city ?? "Dhaka", isDefault: true }
  ] : []);

  const s = makeStyles(colors);

  return (
    <ScrollView style={[s.container]} showsVerticalScrollIndicator={false}>
      <View style={[s.header, { paddingTop: topPad + 8 }]}>
        <Pressable style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Manage Addresses</Text>
        <Pressable style={[s.addBtn, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}
          onPress={() => router.push("/profile/add-address")}>
          <Feather name="plus" size={18} color={colors.primary} />
        </Pressable>
      </View>
      <View style={s.content}>
        {addresses.length === 0 ? (
          <View style={[s.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="map-pin" size={40} color={colors.mutedForeground} />
            <Text style={[s.emptyTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>No addresses saved</Text>
            <Text style={[s.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Add your delivery address for faster checkout</Text>
            <Pressable style={[s.addAddressBtn, { backgroundColor: colors.primary }]} onPress={() => router.push("/profile/add-address")}>
              <Text style={[{ color: "#000", fontFamily: "Inter_700Bold", fontSize: 15 }]}>Add Address</Text>
            </Pressable>
          </View>
        ) : (
          addresses.map((addr) => (
            <View key={addr.id} style={[s.addrCard, { backgroundColor: colors.card, borderColor: addr.isDefault ? colors.primary : colors.border }]}>
              <View style={[s.addrIcon, { backgroundColor: colors.primary + "22" }]}>
                <Feather name="map-pin" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.addrTop}>
                  <Text style={[s.addrLabel, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{addr.label}</Text>
                  {addr.isDefault && <View style={[s.defaultBadge, { backgroundColor: colors.primary + "22" }]}>
                    <Text style={[{ color: colors.primary, fontSize: 10, fontFamily: "Inter_600SemiBold" }]}>Default</Text>
                  </View>}
                </View>
                <Text style={[s.addrFull, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{addr.full}</Text>
                <Text style={[s.addrCity, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{addr.city}</Text>
              </View>
              <Pressable onPress={() => setAddresses(addresses.filter((a) => a.id !== addr.id))}>
                <Feather name="trash-2" size={18} color={colors.destructive} />
              </Pressable>
            </View>
          ))
        )}
        <Pressable style={[s.addNew, { borderColor: colors.border }]} onPress={() => router.push("/profile/add-address")}>
          <Feather name="plus" size={18} color={colors.primary} />
          <Text style={[s.addNewText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>Add New Address</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center" },
    title: { flex: 1, fontSize: 20 },
    addBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center" },
    content: { padding: 16, gap: 12 },
    emptyBox: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: "center", gap: 10 },
    emptyTitle: { fontSize: 16 },
    emptySub: { fontSize: 13, textAlign: "center" },
    addAddressBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 4 },
    addrCard: { flexDirection: "row", borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 12, alignItems: "flex-start" },
    addrIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    addrTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    addrLabel: { fontSize: 15 },
    defaultBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
    addrFull: { fontSize: 13, lineHeight: 18 },
    addrCity: { fontSize: 12, marginTop: 2 },
    addNew: { borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed", height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    addNewText: { fontSize: 15 },
  });
}
