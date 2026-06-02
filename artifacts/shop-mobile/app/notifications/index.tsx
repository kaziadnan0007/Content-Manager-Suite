import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const DEMO_NOTIFS = [
  { id: 1, type: "order", title: "Order Confirmed!", body: "Your order #1042 has been confirmed and is being processed.", time: "2 min ago", read: false },
  { id: 2, type: "delivery", title: "Out for Delivery", body: "Your order #1039 is out for delivery. Expected by 6 PM.", time: "1 hr ago", read: false },
  { id: 3, type: "deal", title: "Flash Sale — 60% Off!", body: "Today only: Electronics up to 60% off. Shop now before stock runs out!", time: "3 hrs ago", read: true },
  { id: 4, type: "order", title: "Order Delivered", body: "Your order #1031 has been delivered. Enjoy your purchase!", time: "Yesterday", read: true },
  { id: 5, type: "deal", title: "Special Offer for You", body: "Free delivery on your next order! Use code: FREEBD at checkout.", time: "2 days ago", read: true },
];

const TYPE_ICON: Record<string, string> = { order: "package", delivery: "truck", deal: "tag" };
const TYPE_COLOR: Record<string, string> = { order: "#00C8FF", delivery: "#3B82F6", deal: "#FFB300" };

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const s = makeStyles(colors);

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Pressable style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Notifications</Text>
        <Pressable>
          <Text style={[{ color: colors.primary, fontSize: 13, fontFamily: "Inter_500Medium" }]}>Mark all read</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {DEMO_NOTIFS.map((n) => {
          const iconColor = TYPE_COLOR[n.type] ?? colors.primary;
          return (
            <Pressable key={n.id} style={[s.item, { backgroundColor: n.read ? colors.background : colors.card, borderBottomColor: colors.border }]}>
              <View style={[s.iconWrap, { backgroundColor: iconColor + "22" }]}>
                <Feather name={TYPE_ICON[n.type] as any} size={20} color={iconColor} />
              </View>
              <View style={s.itemBody}>
                <View style={s.itemTop}>
                  <Text style={[s.itemTitle, { color: colors.text, fontFamily: n.read ? "Inter_500Medium" : "Inter_700Bold" }]} numberOfLines={1}>{n.title}</Text>
                  <Text style={[s.itemTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{n.time}</Text>
                </View>
                <Text style={[s.itemBody2, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>{n.body}</Text>
              </View>
              {!n.read && <View style={[s.unreadDot, { backgroundColor: colors.primary }]} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center" },
    title: { flex: 1, fontSize: 20 },
    item: { flexDirection: "row", alignItems: "flex-start", padding: 16, borderBottomWidth: 1, gap: 12 },
    iconWrap: { width: 46, height: 46, borderRadius: 13, justifyContent: "center", alignItems: "center" },
    itemBody: { flex: 1, gap: 4 },
    itemTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    itemTitle: { flex: 1, fontSize: 14 },
    itemTime: { fontSize: 11, marginLeft: 8 },
    itemBody2: { fontSize: 13, lineHeight: 18 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  });
}
