import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { EmptyState } from "@/components/EmptyState";
import * as Haptics from "expo-haptics";

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();

  const s = makeStyles(colors);

  if (items.length === 0) {
    return (
      <View style={[s.container, { paddingTop: topPad }]}>
        <View style={s.header}>
          <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>My Cart</Text>
        </View>
        <EmptyState icon="shopping-cart" title="Your cart is empty" subtitle="Add items to your cart and they'll appear here" actionLabel="Start Shopping" onAction={() => router.push("/(tabs)/search")} />
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>My Cart ({totalItems})</Text>
        <Pressable onPress={() => { clearCart(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
          <Text style={[s.clearText, { color: colors.destructive, fontFamily: "Inter_500Medium" }]}>Clear all</Text>
        </Pressable>
      </View>

      <ScrollView style={s.list} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
        {items.map((item) => (
          <View key={item.productId} style={[s.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[s.imgWrap, { backgroundColor: colors.muted }]}>
              {item.image ? <Image source={{ uri: item.image }} style={s.img} resizeMode="cover" /> : <Feather name="image" size={28} color={colors.mutedForeground} />}
            </View>
            <View style={s.itemInfo}>
              <Text style={[s.itemName, { color: colors.text, fontFamily: "Inter_500Medium" }]} numberOfLines={2}>{item.name}</Text>
              <Text style={[s.itemPrice, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>৳{item.price.toLocaleString()}</Text>
              {item.comparePrice && item.comparePrice > item.price && (
                <Text style={[s.oldPrice, { color: colors.mutedForeground }]}>৳{item.comparePrice.toLocaleString()}</Text>
              )}
              <View style={s.qtyRow}>
                <Pressable style={[s.qtyBtn, { borderColor: colors.border }]} onPress={() => { updateQuantity(item.productId, item.quantity - 1); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                  <Feather name="minus" size={14} color={colors.text} />
                </Pressable>
                <Text style={[s.qty, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{item.quantity}</Text>
                <Pressable style={[s.qtyBtn, { borderColor: colors.border, backgroundColor: colors.primary }]}
                  onPress={() => { updateQuantity(item.productId, item.quantity + 1); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  disabled={item.quantity >= item.stock}>
                  <Feather name="plus" size={14} color="#000" />
                </Pressable>
              </View>
            </View>
            <Pressable style={s.deleteBtn} onPress={() => { removeItem(item.productId); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
              <Feather name="trash-2" size={18} color={colors.destructive} />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {/* Sticky bottom */}
      <View style={[s.bottom, { paddingBottom: botPad + 16, backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={s.totalRow}>
          <Text style={[s.totalLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Subtotal ({totalItems} items)</Text>
          <Text style={[s.totalPrice, { color: colors.text, fontFamily: "Inter_700Bold" }]}>৳{totalPrice.toLocaleString()}</Text>
        </View>
        <View style={s.totalRow}>
          <Text style={[s.totalLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Delivery</Text>
          <Text style={[{ fontSize: 13, color: colors.success, fontFamily: "Inter_500Medium" }]}>Calculated at checkout</Text>
        </View>
        <Pressable
          style={({ pressed }) => [s.checkoutBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.push("/checkout")}
        >
          <Feather name="shield" size={18} color="#000" />
          <Text style={[s.checkoutText, { fontFamily: "Inter_700Bold" }]}>Secure Checkout — ৳{totalPrice.toLocaleString()}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
    title: { fontSize: 22 },
    clearText: { fontSize: 13 },
    list: { flex: 1, paddingHorizontal: 16 },
    item: { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10, gap: 12 },
    imgWrap: { width: 72, height: 72, borderRadius: 10, justifyContent: "center", alignItems: "center", overflow: "hidden" },
    img: { width: "100%", height: "100%" },
    itemInfo: { flex: 1, gap: 3 },
    itemName: { fontSize: 13, lineHeight: 18 },
    itemPrice: { fontSize: 16 },
    oldPrice: { fontSize: 11, textDecorationLine: "line-through" },
    qtyRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
    qtyBtn: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, justifyContent: "center", alignItems: "center" },
    qty: { fontSize: 15, minWidth: 24, textAlign: "center" },
    deleteBtn: { padding: 4 },
    bottom: { padding: 16, borderTopWidth: 1, gap: 8 },
    totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    totalLabel: { fontSize: 13 },
    totalPrice: { fontSize: 18 },
    checkoutBtn: { height: 54, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 4 },
    checkoutText: { fontSize: 16, color: "#000" },
  });
}
