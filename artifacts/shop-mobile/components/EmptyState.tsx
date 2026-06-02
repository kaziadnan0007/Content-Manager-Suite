import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface EmptyStateProps {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = "inbox", title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Feather name={icon} size={40} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{title}</Text>
      {!!subtitle && <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <Pressable style={({ pressed }) => [styles.btn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]} onPress={onAction}>
          <Text style={[styles.btnText, { fontFamily: "Inter_600SemiBold" }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40, paddingVertical: 60, gap: 12 },
  iconWrap: { width: 80, height: 80, borderRadius: 24, borderWidth: 1, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  title: { fontSize: 18, textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  btnText: { fontSize: 15, color: "#000" },
});
