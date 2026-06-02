import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Dimensions, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useWishlist } from "@/context/WishlistContext";
import { useListProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

export default function WishlistScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { ids, toggle } = useWishlist();
  const { data, isLoading } = useListProducts({ limit: 100 });
  const allProducts = (data as any)?.products ?? [];
  const wishlistProducts = allProducts.filter((p: any) => ids.includes(p.id));

  const s = makeStyles(colors);

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Pressable style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>My Wishlist ({ids.length})</Text>
      </View>

      {isLoading ? (
        <View style={s.loader}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : wishlistProducts.length === 0 ? (
        <EmptyState icon="heart" title="Your wishlist is empty" subtitle="Save items you love and they'll show up here" actionLabel="Start Shopping" onAction={() => router.push("/(tabs)/search")} />
      ) : (
        <FlatList
          data={wishlistProducts}
          numColumns={2}
          keyExtractor={(p: any) => String(p.id)}
          contentContainerStyle={s.grid}
          columnWrapperStyle={{ gap: 8, justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ProductCard product={item as any} width={CARD_W} />}
          ListFooterComponent={<View style={{ height: 60 }} />}
        />
      )}
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center" },
    title: { flex: 1, fontSize: 20 },
    loader: { flex: 1, justifyContent: "center", alignItems: "center" },
    grid: { paddingHorizontal: 16, paddingTop: 4 },
  });
}
