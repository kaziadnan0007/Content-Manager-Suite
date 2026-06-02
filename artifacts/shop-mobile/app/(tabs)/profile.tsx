import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  danger?: boolean;
  badge?: string;
}

const MENU_GROUPS: { title: string; items: MenuItem[] }[] = [
  {
    title: "Account",
    items: [
      { icon: "user", label: "Your Profile", route: "/profile/edit" },
      { icon: "map-pin", label: "Manage Addresses", route: "/profile/addresses" },
      { icon: "credit-card", label: "Payment Methods", route: "/profile/payment-methods" },
      { icon: "lock", label: "Password Manager", route: "/profile/password" },
    ],
  },
  {
    title: "Shopping",
    items: [
      { icon: "package", label: "My Orders", route: "/(tabs)/orders" },
      { icon: "navigation", label: "Track Order", route: "/profile/track" },
      { icon: "heart", label: "Wishlist", route: "/profile/wishlist" },
    ],
  },
  {
    title: "Wallet",
    items: [
      { icon: "dollar-sign", label: "My Wallet", route: "/profile/wallet" },
      { icon: "plus-circle", label: "Add Money", route: "/profile/add-money" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: "help-circle", label: "Help Center", route: "/profile/help" },
      { icon: "shield", label: "Privacy Policy", route: "/profile/privacy" },
      { icon: "share-2", label: "Invite Friends", route: "/profile/invite" },
    ],
  },
  {
    title: "",
    items: [
      { icon: "settings", label: "Settings", route: "/profile/settings" },
      { icon: "log-out", label: "Logout", danger: true },
    ],
  },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await signOut();
    router.replace("/auth/sign-in");
  };

  const handlePress = (item: MenuItem) => {
    if (item.danger) { handleLogout(); return; }
    if (item.route) router.push(item.route as any);
  };

  const initials = user?.name?.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "AG";

  const s = makeStyles(colors);

  return (
    <ScrollView style={[s.container]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Profile header */}
      <View style={[s.profileHeader, { paddingTop: topPad + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable style={[s.avatar, { backgroundColor: user?.avatarColor ?? colors.primary }]} onPress={() => router.push("/profile/edit")}>
          <Text style={[s.avatarText, { fontFamily: "Inter_700Bold" }]}>{initials}</Text>
        </Pressable>
        <View style={s.profileInfo}>
          <Text style={[s.name, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{user?.name ?? "Guest"}</Text>
          <Text style={[s.phone, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{user?.phone ?? ""}</Text>
          {user?.city && <Text style={[s.city, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{user.city}</Text>}
        </View>
        <Pressable style={[s.editBtn, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]} onPress={() => router.push("/profile/edit")}>
          <Feather name="edit-2" size={16} color={colors.primary} />
        </Pressable>
      </View>

      {/* Quick stats */}
      <View style={[s.statsRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {[
          { label: "Orders", value: "0", icon: "package" },
          { label: "Wishlist", value: "0", icon: "heart" },
          { label: "Wallet", value: "৳0", icon: "dollar-sign" },
        ].map(({ label, value, icon }) => (
          <View key={label} style={s.statItem}>
            <Feather name={icon as any} size={20} color={colors.primary} />
            <Text style={[s.statValue, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{value}</Text>
            <Text style={[s.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Menu groups */}
      {MENU_GROUPS.map((group, gi) => (
        <View key={gi} style={s.group}>
          {group.title ? <Text style={[s.groupTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{group.title}</Text> : null}
          <View style={[s.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {group.items.map((item, ii) => (
              <React.Fragment key={item.label}>
                <Pressable
                  style={({ pressed }) => [s.menuItem, { opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => handlePress(item)}
                >
                  <View style={[s.menuIcon, { backgroundColor: item.danger ? colors.destructive + "22" : colors.primary + "15" }]}>
                    <Feather name={item.icon as any} size={18} color={item.danger ? colors.destructive : colors.primary} />
                  </View>
                  <Text style={[s.menuLabel, { color: item.danger ? colors.destructive : colors.text, fontFamily: "Inter_500Medium" }]}>{item.label}</Text>
                  {!item.danger && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
                </Pressable>
                {ii < group.items.length - 1 && <View style={[s.divider, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    profileHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, gap: 14 },
    avatar: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center" },
    avatarText: { fontSize: 24, color: "#fff" },
    profileInfo: { flex: 1 },
    name: { fontSize: 18 },
    phone: { fontSize: 13, marginTop: 2 },
    city: { fontSize: 12, marginTop: 1 },
    editBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, justifyContent: "center", alignItems: "center" },
    statsRow: { flexDirection: "row", borderBottomWidth: 1, paddingVertical: 16 },
    statItem: { flex: 1, alignItems: "center", gap: 4 },
    statValue: { fontSize: 16 },
    statLabel: { fontSize: 11 },
    group: { paddingHorizontal: 16, paddingTop: 16 },
    groupTitle: { fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginLeft: 2 },
    groupCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
    menuItem: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
    menuIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    menuLabel: { flex: 1, fontSize: 14 },
    divider: { height: 1, marginLeft: 62 },
  });
}
