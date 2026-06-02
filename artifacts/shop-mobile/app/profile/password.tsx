import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

// Alias to new-password screen
export default function PasswordScreen() {
  return require("@/app/auth/new-password").default();
}
