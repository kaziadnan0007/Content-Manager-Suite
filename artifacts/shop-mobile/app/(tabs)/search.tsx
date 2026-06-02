import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Dimensions, FlatList, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low", value: "price_asc" },
  { label: "Price: High", value: "price_desc" },
  { label: "Popular", value: "popular" },
];

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(q ?? "");
  const [activeCat, setActiveCat] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const { data: catsData } = useListCategories();
  const { data, isLoading } = useListProducts({
    search: query || undefined,
    categoryId: activeCat,
    limit: 20,
    page,
  });

  const products = data?.products ?? [];
  const total = data?.total ?? 0;
  const cats = catsData ?? [];

  const s = makeStyles(colors);

  return (
    <View style={[s.container]}>
      {/* Search Header */}
      <View style={[s.header, { paddingTop: topPad + 8, backgroundColor: colors.header }]}>
        <View style={[s.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.primary} />
          <TextInput
            style={[s.input, { color: colors.text, fontFamily: "Inter_400Regular" }]}
            placeholder="Search products, brands..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={(t) => { setQuery(t); setPage(1); }}
            returnKeyType="search"
            autoFocus={!q}
          />
          {!!query && <Pressable onPress={() => { setQuery(""); setPage(1); }}>
            <Feather name="x" size={18} color={colors.mutedForeground} />
          </Pressable>}
        </View>
      </View>

      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll}
        contentContainerStyle={s.catRow}>
        <Pressable
          style={[s.catPill, { backgroundColor: !activeCat ? colors.primary : colors.card, borderColor: !activeCat ? colors.primary : colors.border }]}
          onPress={() => { setActiveCat(undefined); setPage(1); }}>
          <Text style={[s.catPillText, { color: !activeCat ? "#000" : colors.text, fontFamily: "Inter_500Medium" }]}>All</Text>
        </Pressable>
        {cats.map((c) => (
          <Pressable key={c.id}
            style={[s.catPill, { backgroundColor: activeCat === c.id ? colors.primary : colors.card, borderColor: activeCat === c.id ? colors.primary : colors.border }]}
            onPress={() => { setActiveCat(c.id); setPage(1); }}>
            <Text style={[s.catPillText, { color: activeCat === c.id ? "#000" : colors.text, fontFamily: "Inter_500Medium" }]}>{c.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Results count */}
      <View style={s.resultsRow}>
        <Text style={[s.resultsText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {isLoading ? "Searching..." : `${total} products found`}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {SORT_OPTIONS.map((opt) => (
            <Pressable key={opt.value} style={[s.sortChip, { backgroundColor: sort === opt.value ? colors.primary + "22" : "transparent", borderColor: sort === opt.value ? colors.primary : colors.border }]}
              onPress={() => setSort(opt.value)}>
              <Text style={[s.sortChipText, { color: sort === opt.value ? colors.primary : colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{opt.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={s.loader}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : products.length === 0 ? (
        <EmptyState icon="search" title="No products found" subtitle="Try a different search or category" actionLabel="Clear filters" onAction={() => { setQuery(""); setActiveCat(undefined); }} />
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
          onEndReachedThreshold={0.3}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 16, paddingBottom: 10 },
    searchBar: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1.5, height: 48, paddingHorizontal: 14, gap: 10 },
    input: { flex: 1, fontSize: 15, height: "100%" },
    catScroll: { maxHeight: 48 },
    catRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 6, alignItems: "center" },
    catPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    catPillText: { fontSize: 13 },
    resultsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginVertical: 8, gap: 8 },
    resultsText: { fontSize: 12, flexShrink: 0 },
    sortChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
    sortChipText: { fontSize: 11 },
    loader: { flex: 1, justifyContent: "center", alignItems: "center" },
    grid: { paddingHorizontal: 16, paddingTop: 4 },
  });
}
