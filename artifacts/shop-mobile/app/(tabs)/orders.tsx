import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList, Platform, Pressable, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useOrders } from "@/context/OrdersContext";
import { EmptyState } from "@/components/EmptyState";

const TABS = ["Active", "Completed", "Cancelled"] as const;

const STATUS_COLOR: Record<string, string> = {
  pending: "#FFB300",
  processing: "#3B82F6",
  shipped: "#00C8FF",
  delivered: "#00C896",
  cancelled: "#FF3355",
};

const STATUS_ICON: Record<string, string> = {
  pending: "clock",
  processing: "refresh-cw",
  shipped: "truck",
  delivered: "check-circle",
  cancelled: "x-circle",
};

function isActive(status: string) {
  return ["pending", "processing", "shipped"].includes(status);
}
function isCompleted(status: string) { return status === "delivered"; }
function isCancelled(status: string) { return status === "cancelled"; }

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { orders } = useOrders();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Active");

  const filtered = orders.filter((o) => {
    if (activeTab === "Active") return isActive(o.status);
    if (activeTab === "Completed") return isCompleted(o.status);
    return isCancelled(o.status);
  });

  const s = makeStyles(colors);

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>My Orders</Text>

      {/* Tabs */}
      <View style={[s.tabRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {TABS.map((tab) => {
          const count = orders.filter((o) =>
            tab === "Active" ? isActive(o.status) : tab === "Completed" ? isCompleted(o.status) : isCancelled(o.status)
          ).length;
          return (
            <Pressable key={tab} style={[s.tab, activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(tab)}>
              <Text style={[s.tabText, { color: activeTab === tab ? colors.primary : colors.mutedForeground, fontFamily: activeTab === tab ? "Inter_600SemiBold" : "Inter_400Regular" }]}>{tab}</Text>
              {count > 0 && <View style={[s.tabBadge, { backgroundColor: activeTab === tab ? colors.primary : colors.border }]}>
                <Text style={[s.tabBadgeText, { color: activeTab === tab ? "#000" : colors.mutedForeground }]}>{count}</Text>
              </View>}
            </Pressable>
          );
        })}
      </View>

      {filtered.length === 0 ? (
        <EmptyState icon="package" title={`No ${activeTab.toLowerCase()} orders`} subtitle="Orders you place will appear here" actionLabel="Start Shopping" onAction={() => router.push("/(tabs)/search")} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(o) => String(o.orderId)}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const statusColor = STATUS_COLOR[item.status] ?? colors.mutedForeground;
            const icon = STATUS_ICON[item.status] ?? "package";
            return (
              <Pressable style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/order/${item.orderId}`)}>
                <View style={s.cardTop}>
                  <View style={[s.statusIcon, { backgroundColor: statusColor + "22" }]}>
                    <Feather name={icon as any} size={18} color={statusColor} />
                  </View>
                  <View style={s.cardInfo}>
                    <Text style={[s.orderId, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>Order #{item.orderId}</Text>
                    <Text style={[s.orderDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {new Date(item.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                    </Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: statusColor + "22", borderColor: statusColor + "44" }]}>
                    <Text style={[s.statusText, { color: statusColor, fontFamily: "Inter_600SemiBold" }]}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
                  </View>
                </View>
                <View style={[s.cardBottom, { borderTopColor: colors.border }]}>
                  <Text style={[s.totalLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Total amount</Text>
                  <Text style={[s.totalAmt, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>৳{item.total.toLocaleString()}</Text>
                </View>
                <View style={s.cardFooter}>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                  <Text style={[s.trackLink, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>Track Order</Text>
                </View>
              </Pressable>
            );
          }}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    title: { fontSize: 22, paddingHorizontal: 16, paddingVertical: 12 },
    tabRow: { flexDirection: "row", borderBottomWidth: 1, marginBottom: 8 },
    tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, gap: 6 },
    tabText: { fontSize: 13 },
    tabBadge: { width: 18, height: 18, borderRadius: 9, justifyContent: "center", alignItems: "center" },
    tabBadgeText: { fontSize: 10 },
    list: { paddingHorizontal: 16, paddingTop: 4 },
    card: { borderRadius: 14, borderWidth: 1, marginBottom: 10, overflow: "hidden" },
    cardTop: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
    statusIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    cardInfo: { flex: 1 },
    orderId: { fontSize: 14 },
    orderDate: { fontSize: 12, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
    statusText: { fontSize: 11 },
    cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
    totalLabel: { fontSize: 12 },
    totalAmt: { fontSize: 16 },
    cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4, paddingHorizontal: 14, paddingBottom: 10 },
    trackLink: { fontSize: 13 },
  });
}
