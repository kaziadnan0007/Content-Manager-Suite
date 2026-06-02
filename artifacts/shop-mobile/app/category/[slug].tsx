import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListCategories, useListProducts } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

export default function CategoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  const { data: catsData } = useListCategories();
  const cat = (catsData ?? []).find((c) => c.slug === slug);

  const { data, isLoading } = useListProducts({ categoryId: cat?.id, limit: 20, page });
  const products = data?.products ?? [];
  const total = data?.total ?? 0;

  const s = makeStyles(colors);

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Pressable style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={[s.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{cat?.name ?? slug}</Text>
        <Text style={[s.count, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{total} items</Text>
      </View>

      {isLoading ? (
        <View style={s.loader}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : products.length === 0 ? (
        <EmptyState icon="package" title="No products in this category" subtitle="Check back later for new arrivals" actionLabel="Browse all" onAction={() => router.push("/(tabs)/search")} />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={s.grid}
          columnWrapperStyle={{ gap: 8, justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ProductCard product={item as any} width={CARD_W} />}
          onEndReached={() => { if (products.length < total) setPage((p) => p + 1); }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={<View style={{ height: 100 }} />}
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
    count: { fontSize: 13 },
    loader: { flex: 1, justifyContent: "center", alignItems: "center" },
    grid: { paddingHorizontal: 16, paddingTop: 4 },
  });
}
