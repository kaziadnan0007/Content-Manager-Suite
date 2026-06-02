import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserProfile {
  phone: string;
  name: string;
  email?: string;
  address?: string;
  city?: string;
  avatarColor?: string;
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isOnboarded: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (profile: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setOnboarded: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isOnboarded: false,
  signIn: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
  setOnboarded: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboardedState] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [userStr, onboarded] = await Promise.all([
          AsyncStorage.getItem("ag_user"),
          AsyncStorage.getItem("ag_onboarded"),
        ]);
        if (userStr) setUser(JSON.parse(userStr));
        if (onboarded === "1") setIsOnboardedState(true);
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  const signIn = async (profile: UserProfile) => {
    await AsyncStorage.setItem("ag_user", JSON.stringify(profile));
    setUser(profile);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem("ag_user");
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = { ...user, ...updates } as UserProfile;
    await AsyncStorage.setItem("ag_user", JSON.stringify(updated));
    setUser(updated);
  };

  const setOnboarded = async () => {
    await AsyncStorage.setItem("ag_onboarded", "1");
    setIsOnboardedState(true);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isOnboarded, signIn, signOut, updateProfile, setOnboarded }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
