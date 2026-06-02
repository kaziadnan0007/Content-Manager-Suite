import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import * as Haptics from "expo-haptics";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number | string;
    comparePrice?: number | string | null;
    images?: string[] | null;
    badge?: string | null;
    stock: number;
    featured?: boolean | null;
  };
  width?: number;
}

function fakeRating(id: number) { return (3.5 + (id % 5) * 0.3).toFixed(1); }
function fakeReviews(id: number) { return 12 + (id * 17) % 240; }
function fakeSold(id: number) { return 50 + (id * 43) % 950; }

export function ProductCard({ product, width = 170 }: ProductCardProps) {
  const colors = useColors();
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const price = Number(product.price);
  const comparePrice = Number(product.comparePrice);
  const discount = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : null;
  const wishlisted = isWishlisted(product.id);
  const img = product.images?.[0];

  const handleAdd = (e: any) => {
    e.stopPropagation?.();
    addItem({
      productId: product.id,
      name: product.name,
      price,
      comparePrice,
      image: img,
      stock: product.stock,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleWish = (e: any) => {
    e.stopPropagation?.();
    toggle(product.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Pressable
      style={[styles.card, { width, backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      {/* Image */}
      <View style={[styles.imgWrap, { backgroundColor: colors.muted }]}>
        {img ? (
          <Image source={{ uri: img }} style={styles.img} resizeMode="cover" />
        ) : (
          <Feather name="image" size={32} color={colors.mutedForeground} />
        )}
        {!!product.badge && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { fontFamily: "Inter_700Bold" }]}>{product.badge}</Text>
          </View>
        )}
        {discount && discount > 0 && (
          <View style={[styles.discountBadge, { backgroundColor: colors.destructive }]}>
            <Text style={[styles.discountText, { fontFamily: "Inter_700Bold" }]}>-{discount}%</Text>
          </View>
        )}
        <Pressable style={[styles.wishBtn, { backgroundColor: colors.background + "DD" }]} onPress={handleWish}>
          <Feather name="heart" size={16} color={wishlisted ? colors.destructive : colors.mutedForeground} />
        </Pressable>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text, fontFamily: "Inter_500Medium" }]} numberOfLines={2}>{product.name}</Text>
        
        {/* Rating */}
        <View style={styles.ratingRow}>
          <Feather name="star" size={11} color={colors.warning} />
          <Text style={[styles.ratingText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {fakeRating(product.id)} ({fakeReviews(product.id)}) · {fakeSold(product.id)} sold
          </Text>
        </View>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>৳{price.toLocaleString()}</Text>
          {comparePrice > price && (
            <Text style={[styles.oldPrice, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>৳{comparePrice.toLocaleString()}</Text>
          )}
        </View>

        {/* Add to cart */}
        <Pressable
          style={({ pressed }) => [styles.addBtn, { backgroundColor: colors.primary, opacity: product.stock === 0 ? 0.4 : pressed ? 0.8 : 1 }]}
          onPress={handleAdd}
          disabled={product.stock === 0}
        >
          <Feather name="shopping-cart" size={14} color="#000" />
          <Text style={[styles.addText, { fontFamily: "Inter_600SemiBold" }]}>{product.stock === 0 ? "Out of Stock" : "Add"}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 2 },
  imgWrap: { width: "100%", height: 160, justifyContent: "center", alignItems: "center", position: "relative" },
  img: { width: "100%", height: "100%" },
  badge: { position: "absolute", top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, color: "#000" },
  discountBadge: { position: "absolute", top: 8, right: 36, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  discountText: { fontSize: 10, color: "#fff" },
  wishBtn: { position: "absolute", top: 6, right: 6, width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  info: { padding: 10, gap: 4 },
  name: { fontSize: 13, lineHeight: 18 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontSize: 10 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  price: { fontSize: 15 },
  oldPrice: { fontSize: 11, textDecorationLine: "line-through" },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, height: 30, borderRadius: 8, marginTop: 2 },
  addText: { fontSize: 12, color: "#000" },
});
