import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    icon: "shopping-bag" as const,
    title: "Millions of Products",
    subtitle: "Electronics, Fashion, Home, Beauty & more — all in one place. Best brands, best prices.",
    color: "#00D4FF",
  },
  {
    icon: "truck" as const,
    title: "Fast Delivery",
    subtitle: "Get your orders delivered to your doorstep across Bangladesh. Track every step.",
    color: "#3B82F6",
  },
  {
    icon: "shield" as const,
    title: "100% Secure",
    subtitle: "Pay with bKash, Rocket, or Cash on Delivery. Your money is always safe with us.",
    color: "#00C896",
  },
  {
    icon: "star" as const,
    title: "Flash Deals Daily",
    subtitle: "Exclusive daily deals up to 70% off. Never miss a sale — join millions of happy shoppers.",
    color: "#FFB300",
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setOnboarded } = useAuth();
  const [activeIdx, setActiveIdx] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const isLast = activeIdx === SLIDES.length - 1;

  const handleNext = async () => {
    if (isLast) {
      await setOnboarded();
      router.replace("/auth/sign-in");
    } else {
      flatRef.current?.scrollToIndex({ index: activeIdx + 1, animated: true });
    }
  };

  const handleSkip = async () => {
    await setOnboarded();
    router.replace("/auth/sign-in");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable style={[styles.skipBtn, { top: topPad + 16 }]} onPress={handleSkip}>
        <Text style={[styles.skipText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Skip</Text>
      </Pressable>

      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setActiveIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconWrap, { backgroundColor: item.color + "22", borderColor: item.color + "55" }]}>
              <Feather name={item.icon} size={64} color={item.color} />
            </View>
            <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{item.title}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.subtitle}</Text>
          </View>
        )}
        keyExtractor={(_, i) => String(i)}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                width: i === activeIdx ? 24 : 8,
                backgroundColor: i === activeIdx ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </View>

      <View style={[styles.btnArea, { paddingBottom: botPad + 16, paddingHorizontal: 24 }]}>
        <Pressable
          style={({ pressed }) => [styles.btn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          onPress={handleNext}
        >
          <Text style={[styles.btnText, { fontFamily: "Inter_700Bold" }]}>{isLast ? "Start Shopping" : "Next"}</Text>
          <Feather name={isLast ? "shopping-bag" : "arrow-right"} size={20} color="#000" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { position: "absolute", right: 20, zIndex: 10, paddingHorizontal: 12, paddingVertical: 6 },
  skipText: { fontSize: 14 },
  slide: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 36, paddingTop: 60 },
  iconWrap: { width: 140, height: 140, borderRadius: 36, borderWidth: 1.5, justifyContent: "center", alignItems: "center", marginBottom: 36 },
  title: { fontSize: 28, textAlign: "center", marginBottom: 16, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, textAlign: "center", lineHeight: 24 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 20 },
  dot: { height: 8, borderRadius: 4 },
  btnArea: { paddingHorizontal: 24 },
  btn: { height: 56, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  btnText: { fontSize: 18, color: "#000" },
});
