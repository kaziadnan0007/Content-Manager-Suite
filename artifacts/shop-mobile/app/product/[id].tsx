import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions, Image, Platform, Pressable, ScrollView,
  StyleSheet, Text, View, FlatList, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetProduct } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

function fakeRating(id: number) { return (3.5 + (id % 5) * 0.3).toFixed(1); }
function fakeReviews(id: number) { return 12 + (id * 17) % 240; }

export default function ProductDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading, error } = useGetProduct({ id: Number(id) });
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);

  const s = makeStyles(colors);

  if (isLoading) return (
    <View style={[s.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );

  if (!product || error) return (
    <View style={[s.center, { backgroundColor: colors.background }]}>
      <Text style={[{ color: colors.text, fontFamily: "Inter_500Medium" }]}>Product not found</Text>
      <Pressable onPress={() => router.back()} style={[s.backBtnSm, { borderColor: colors.border }]}>
        <Text style={{ color: colors.primary }}>Go back</Text>
      </Pressable>
    </View>
  );

  const price = Number(product.price);
  const comparePrice = Number(product.comparePrice);
  const discount = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const images: string[] = (product.images as string[] | null) ?? [];
  const wishlisted = isWishlisted(product.id);
  const rating = fakeRating(product.id);
  const reviews = fakeReviews(product.id);

  const handleAddToCart = () => {
    addItem({ productId: product.id, name: product.name, price, comparePrice, image: images[0], stock: product.stock }, qty);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleBuyNow = () => {
    addItem({ productId: product.id, name: product.name, price, comparePrice, image: images[0], stock: product.stock }, qty);
    router.push("/checkout");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: topPad + 8, backgroundColor: colors.background }]}>
        <Pressable style={[s.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <View style={s.headerBtns}>
          <Pressable style={[s.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => { toggle(product.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
            <Feather name="heart" size={20} color={wishlisted ? colors.destructive : colors.text} />
          </Pressable>
          <Pressable style={[s.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push("/(tabs)/cart")}>
            <Feather name="shopping-cart" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Image carousel */}
        <View style={s.imgSection}>
          {images.length > 0 ? (
            <>
              <FlatList
                horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                data={images}
                onMomentumScrollEnd={(e) => setImgIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={{ width, height: 340 }} resizeMode="contain" />
                )}
                keyExtractor={(_, i) => String(i)}
              />
              {images.length > 1 && (
                <View style={s.imgDots}>
                  {images.map((_, i) => (
                    <View key={i} style={[s.dot, { backgroundColor: i === imgIdx ? colors.primary : colors.border, width: i === imgIdx ? 18 : 6 }]} />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={[s.noImg, { backgroundColor: colors.muted }]}>
              <Feather name="image" size={48} color={colors.mutedForeground} />
            </View>
          )}
          {discount > 0 && (
            <View style={[s.discBadge, { backgroundColor: colors.destructive }]}>
              <Text style={[s.discText, { fontFamily: "Inter_700Bold" }]}>-{discount}%</Text>
            </View>
          )}
        </View>

        <View style={s.info}>
          {/* Badge + Category */}
          <View style={s.badgeRow}>
            {product.badge && <View style={[s.badge, { backgroundColor: colors.primary }]}><Text style={[s.badgeText, { fontFamily: "Inter_700Bold" }]}>{product.badge}</Text></View>}
            {product.categoryName && <Text style={[s.catLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{product.categoryName}</Text>}
          </View>

          <Text style={[s.productName, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{product.name}</Text>

          {/* Rating */}
          <View style={s.ratingRow}>
            {[1,2,3,4,5].map((i) => <Feather key={i} name="star" size={14} color={i <= Math.round(Number(rating)) ? colors.warning : colors.border} />)}
            <Text style={[s.ratingText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{rating} ({reviews} reviews)</Text>
          </View>

          {/* Price */}
          <View style={s.priceRow}>
            <Text style={[s.price, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>৳{price.toLocaleString()}</Text>
            {comparePrice > price && (
              <Text style={[s.oldPrice, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>৳{comparePrice.toLocaleString()}</Text>
            )}
            {discount > 0 && <View style={[s.saveBadge, { backgroundColor: colors.success + "22" }]}>
              <Text style={[s.saveText, { color: colors.success, fontFamily: "Inter_600SemiBold" }]}>Save {discount}%</Text>
            </View>}
          </View>

          {/* Stock */}
          <View style={s.stockRow}>
            <Feather name={product.stock > 0 ? "check-circle" : "x-circle"} size={14} color={product.stock > 0 ? colors.success : colors.destructive} />
            <Text style={[s.stockText, { color: product.stock > 0 ? colors.success : colors.destructive, fontFamily: "Inter_500Medium" }]}>
              {product.stock > 0 ? (product.stock <= 10 ? `Only ${product.stock} left!` : "In Stock") : "Out of Stock"}
            </Text>
          </View>

          {/* Qty */}
          <View style={s.qtySection}>
            <Text style={[s.qtyLabel, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>Quantity</Text>
            <View style={s.qtyRow}>
              <Pressable style={[s.qtyBtn, { borderColor: colors.border }]} onPress={() => setQty(Math.max(1, qty - 1))}>
                <Feather name="minus" size={16} color={colors.text} />
              </Pressable>
              <Text style={[s.qtyVal, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{qty}</Text>
              <Pressable style={[s.qtyBtn, { borderColor: colors.border, backgroundColor: colors.primary }]}
                onPress={() => setQty(Math.min(product.stock, qty + 1))} disabled={qty >= product.stock}>
                <Feather name="plus" size={16} color="#000" />
              </Pressable>
              <Text style={[s.totalCalc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>= ৳{(price * qty).toLocaleString()}</Text>
            </View>
          </View>

          {/* Trust badges */}
          <View style={[s.trustBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { icon: "truck", text: "Fast Delivery" },
              { icon: "shield", text: "Authentic Product" },
              { icon: "refresh-cw", text: "Easy Returns" },
            ].map(({ icon, text }) => (
              <View key={text} style={s.trustItem}>
                <Feather name={icon as any} size={16} color={colors.primary} />
                <Text style={[s.trustText, { color: colors.text, fontFamily: "Inter_500Medium" }]}>{text}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          {product.description && (
            <View style={s.descSection}>
              <Text style={[s.descTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Product Details</Text>
              <Text style={[s.desc, { color: colors.textSecondary ?? colors.mutedForeground, fontFamily: "Inter_400Regular", lineHeight: 22 }]}>{product.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom action */}
      <View style={[s.bottomAction, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: botPad + 12 }]}>
        <Pressable
          style={({ pressed }) => [s.addCartBtn, { borderColor: colors.primary, opacity: product.stock === 0 ? 0.4 : pressed ? 0.8 : 1 }]}
          onPress={handleAddToCart} disabled={product.stock === 0}
        >
          <Feather name="shopping-cart" size={18} color={colors.primary} />
          <Text style={[s.addCartText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>Add to Cart</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.buyBtn, { backgroundColor: colors.primary, opacity: product.stock === 0 ? 0.4 : pressed ? 0.8 : 1 }]}
          onPress={handleBuyNow} disabled={product.stock === 0}
        >
          <Text style={[s.buyText, { fontFamily: "Inter_700Bold" }]}>Buy Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
    backBtnSm: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8 },
    headerBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center" },
    headerBtns: { flexDirection: "row", gap: 8 },
    imgSection: { position: "relative" },
    noImg: { width, height: 340, justifyContent: "center", alignItems: "center" },
    imgDots: { flexDirection: "row", justifyContent: "center", gap: 4, marginTop: 8, marginBottom: 4 },
    dot: { height: 6, borderRadius: 3 },
    discBadge: { position: "absolute", top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    discText: { color: "#fff", fontSize: 13 },
    info: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
    badgeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 11, color: "#000" },
    catLabel: { fontSize: 12 },
    productName: { fontSize: 20, lineHeight: 28 },
    ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    ratingText: { fontSize: 12, marginLeft: 4 },
    priceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    price: { fontSize: 26 },
    oldPrice: { fontSize: 16, textDecorationLine: "line-through" },
    saveBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    saveText: { fontSize: 12 },
    stockRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    stockText: { fontSize: 13 },
    qtySection: { gap: 8 },
    qtyLabel: { fontSize: 14 },
    qtyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    qtyBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1.5, justifyContent: "center", alignItems: "center" },
    qtyVal: { fontSize: 18, minWidth: 30, textAlign: "center" },
    totalCalc: { fontSize: 14 },
    trustBox: { flexDirection: "row", justifyContent: "space-around", borderRadius: 14, borderWidth: 1, paddingVertical: 14 },
    trustItem: { alignItems: "center", gap: 6 },
    trustText: { fontSize: 11 },
    descSection: { gap: 8 },
    descTitle: { fontSize: 16 },
    desc: { fontSize: 14 },
    bottomAction: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", gap: 10, padding: 16, borderTopWidth: 1 },
    addCartBtn: { flex: 1, height: 52, borderRadius: 14, borderWidth: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    addCartText: { fontSize: 15 },
    buyBtn: { flex: 1, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    buyText: { fontSize: 16, color: "#000" },
  });
}
