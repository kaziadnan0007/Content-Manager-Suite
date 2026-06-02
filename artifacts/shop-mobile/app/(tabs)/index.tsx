import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListBanners, useListCategories, useListProducts } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ProductCard } from "@/components/ProductCard";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

const CAT_ICONS: Record<string, string> = {
  electronics: "cpu", clothing: "wind", beauty: "droplet", "home-appliances": "monitor",
  sports: "activity", bags: "briefcase", shoes: "zap", watches: "clock", kids: "heart", books: "book",
};

function FlashTimer() {
  const [t, setT] = React.useState(Date.now());
  React.useEffect(() => { const id = setInterval(() => setT(Date.now()), 1000); return () => clearInterval(id); }, []);
  const end = new Date(); end.setHours(23, 59, 59, 999);
  const diff = Math.max(0, end.getTime() - t);
  const h = Math.floor(diff / 3600000).toString().padStart(2, "0");
  const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
  const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
  return { h, m, s };
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { user } = useAuth();
  const { totalItems } = useCart();
  const timer = FlashTimer();
  const [bannerIdx, setBannerIdx] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const { data: bannersData, refetch: refetchBanners } = useListBanners();
  const { data: catsData } = useListCategories();
  const { data: featuredData, refetch: refetchFeatured } = useListProducts({ featured: true, limit: 10 } as any);
  const { data: flashData, refetch: refetchFlash } = useListProducts({ badge: "Hot Deal", limit: 10 } as any);
  const { data: allData, refetch: refetchAll } = useListProducts({ limit: 20 });

  const banners = bannersData ?? [];
  const cats = (catsData ?? []).slice(0, 10);
  const featured = (featuredData as any)?.products ?? [];
  const flash = (flashData as any)?.products ?? [];
  const newest = (allData as any)?.products ?? [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchBanners(), refetchFeatured(), refetchFlash(), refetchAll()]);
    setRefreshing(false);
  };

  const s = makeStyles(colors);

  return (
    <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
    >
      {/* Header */}
      <View style={[s.header, { paddingTop: topPad + 12 }]}>
        <View style={s.headerTop}>
          <View>
            <Text style={[s.greeting, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {user ? `Hello, ${user.name.split(" ")[0]}` : "Welcome back"}
            </Text>
            <Text style={[s.brand, { color: colors.text, fontFamily: "Inter_700Bold" }]}>AcholGatha</Text>
          </View>
          <View style={s.headerRight}>
            <Pressable style={[s.iconBtn, { backgroundColor: colors.muted }]} onPress={() => router.push("/notifications/index")}>
              <Feather name="bell" size={20} color={colors.text} />
            </Pressable>
            <Pressable style={[s.iconBtn, { backgroundColor: colors.muted }]} onPress={() => router.push("/(tabs)/cart")}>
              <Feather name="shopping-cart" size={20} color={colors.text} />
              {totalItems > 0 && (
                <View style={[s.badge, { backgroundColor: colors.destructive }]}>
                  <Text style={[s.badgeText, { fontFamily: "Inter_700Bold" }]}>{totalItems > 9 ? "9+" : String(totalItems)}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
        {/* Search tappable */}
        <Pressable style={[s.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/search")}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <Text style={[s.searchPlaceholder, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Search millions of products...</Text>
          <View style={[s.searchBtn, { backgroundColor: colors.primary }]}>
            <Feather name="search" size={14} color="#000" />
          </View>
        </Pressable>
      </View>

      {/* Banner carousel */}
      {banners.length > 0 && (
        <View style={s.bannerWrap}>
          <FlatList
            horizontal pagingEnabled showsHorizontalScrollIndicator={false} data={banners}
            onMomentumScrollEnd={(e) => setBannerIdx(Math.round(e.nativeEvent.contentOffset.x / (width - 32)))}
            renderItem={({ item }) => (
              <Image source={{ uri: (item as any).imageUrl }} style={[s.bannerImg, { width: width - 32 }]} resizeMode="cover" />
            )}
            keyExtractor={(b: any) => String(b.id)}
          />
          <View style={s.bannerDots}>
            {banners.map((_, i) => (
              <View key={i} style={[s.dot, { backgroundColor: i === bannerIdx ? colors.primary : colors.border, width: i === bannerIdx ? 18 : 6 }]} />
            ))}
          </View>
        </View>
      )}

      {/* Trust badges */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }} contentContainerStyle={s.trustRow}>
        {[
          { icon: "truck", text: "Free Delivery ৳500+" },
          { icon: "shield", text: "100% Authentic" },
          { icon: "refresh-cw", text: "Easy Returns" },
          { icon: "headphones", text: "24/7 Support" },
        ].map(({ icon, text }) => (
          <View key={text} style={[s.trustBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name={icon as any} size={14} color={colors.primary} />
            <Text style={[s.trustText, { color: colors.text, fontFamily: "Inter_500Medium" }]}>{text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Categories */}
      {cats.length > 0 && (
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Shop by Category</Text>
            <Pressable style={s.seeAll} onPress={() => router.push("/(tabs)/search")}>
              <Text style={[s.seeAllText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>See all</Text>
              <Feather name="chevron-right" size={14} color={colors.primary} />
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
            {cats.map((cat: any) => (
              <Pressable key={cat.id} style={[s.catItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/category/${cat.slug}`)}>
                <View style={[s.catIcon, { backgroundColor: colors.primary + "22" }]}>
                  <Feather name={((CAT_ICONS as any)[cat.slug] ?? "grid") as any} size={22} color={colors.primary} />
                </View>
                <Text style={[s.catName, { color: colors.text, fontFamily: "Inter_500Medium" }]} numberOfLines={2}>{cat.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Flash Sale */}
      {flash.length > 0 && (
        <View style={s.section}>
          <View style={[s.flashHeader, { backgroundColor: colors.destructive }]}>
            <Feather name="zap" size={18} color="#fff" />
            <Text style={[s.flashTitle, { fontFamily: "Inter_700Bold" }]}>Flash Sale</Text>
            <View style={s.timerRow}>
              {[timer.h, timer.m, timer.s].map((v, i) => (
                <React.Fragment key={i}>
                  <View style={s.timeBox}>
                    <Text style={[s.timeVal, { fontFamily: "Inter_700Bold" }]}>{v}</Text>
                  </View>
                  {i < 2 && <Text style={s.timeSep}>:</Text>}
                </React.Fragment>
              ))}
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hScroll}>
            {flash.map((p: any) => <ProductCard key={p.id} product={p} width={CARD_W} />)}
          </ScrollView>
        </View>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Featured Products</Text>
            <Pressable style={s.seeAll} onPress={() => router.push("/(tabs)/search")}>
              <Text style={[s.seeAllText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>View all</Text>
              <Feather name="chevron-right" size={14} color={colors.primary} />
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hScroll}>
            {featured.map((p: any) => <ProductCard key={p.id} product={p} width={CARD_W} />)}
          </ScrollView>
        </View>
      )}

      {/* All Products Grid */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>All Products</Text>
          <Pressable style={s.seeAll} onPress={() => router.push("/(tabs)/search")}>
            <Text style={[s.seeAllText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>Browse all</Text>
            <Feather name="chevron-right" size={14} color={colors.primary} />
          </Pressable>
        </View>
        {newest.length === 0 ? (
          <View style={s.emptyMsg}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <View style={s.grid}>
            {newest.map((p: any) => <ProductCard key={p.id} product={p} width={CARD_W} />)}
          </View>
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/hooks/useColors").useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 16, paddingBottom: 12, backgroundColor: colors.header },
    headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    greeting: { fontSize: 12 },
    brand: { fontSize: 22 },
    headerRight: { flexDirection: "row", gap: 8 },
    iconBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    badge: { position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: 9, justifyContent: "center", alignItems: "center" },
    badgeText: { fontSize: 9, color: "#fff" },
    searchBar: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, height: 46, paddingHorizontal: 14, gap: 10 },
    searchPlaceholder: { flex: 1, fontSize: 14 },
    searchBtn: { width: 30, height: 30, borderRadius: 8, justifyContent: "center", alignItems: "center" },
    bannerWrap: { marginHorizontal: 16, marginBottom: 16 },
    bannerImg: { height: 160, borderRadius: 14 },
    bannerDots: { flexDirection: "row", justifyContent: "center", gap: 4, marginTop: 8 },
    dot: { height: 6, borderRadius: 3 },
    trustRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 4 },
    trustBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
    trustText: { fontSize: 11 },
    section: { marginBottom: 20 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, marginBottom: 10 },
    sectionTitle: { fontSize: 16 },
    seeAll: { flexDirection: "row", alignItems: "center", gap: 2 },
    seeAllText: { fontSize: 13 },
    catRow: { paddingHorizontal: 16, gap: 10 },
    catItem: { alignItems: "center", gap: 6, padding: 12, borderRadius: 14, borderWidth: 1, width: 76 },
    catIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    catName: { fontSize: 10, textAlign: "center" },
    flashHeader: { marginHorizontal: 16, borderRadius: 12, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, gap: 8, marginBottom: 10 },
    flashTitle: { fontSize: 16, color: "#fff", flex: 1 },
    timerRow: { flexDirection: "row", alignItems: "center", gap: 3 },
    timeBox: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, backgroundColor: "#00000033" },
    timeVal: { fontSize: 13, color: "#fff" },
    timeSep: { fontSize: 13, color: "#fff", fontWeight: "bold" },
    hScroll: { paddingHorizontal: 16, gap: 10 },
    emptyMsg: { alignItems: "center", padding: 20 },
    grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 8, justifyContent: "space-between" },
  });
}
