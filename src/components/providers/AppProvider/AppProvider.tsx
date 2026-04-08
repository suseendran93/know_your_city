"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  getFirebaseAuth,
  getFirebaseDb,
  initFirebaseAnalytics,
  isFirebaseConfigured
} from "@/lib/firebase/client";
import {
  defaultUserStats,
  ensureUserProfile,
  recordGameResult as persistGameResult,
  updateUserCity
} from "@/lib/firebase/userProfile";
import {
  loginWithEmailPassword,
  logout as logoutFirebase,
  mapFirebaseUserToAppUser,
  sendPasswordReset,
  signupWithEmailPassword
} from "@/lib/firebase/auth";
import type { AppUser, GameModeKey, SupportedCity, UserStats } from "@/types/app";

type AppContextValue = {
  hydrated: boolean;
  firebaseEnabled: boolean;
  user: AppUser | null;
  city: SupportedCity | null;
  stats: UserStats;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (payload: { name: string; email: string; password: string }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  setCity: (city: SupportedCity) => Promise<void>;
  recordGameResult: (mode: GameModeKey, score: number) => Promise<void>;
};

const STORAGE_KEY = "kyc_app_state_v1";
const AppContext = createContext<AppContextValue | null>(null);

type LocalFallbackState = {
  user: AppUser | null;
  city: SupportedCity | null;
  stats: UserStats;
};

type AppProviderProps = {
  children: React.ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  const firebaseEnabled = isFirebaseConfigured();
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [city, setCityState] = useState<SupportedCity | null>(null);
  const [stats, setStats] = useState<UserStats>(defaultUserStats);

  useEffect(() => {
    if (firebaseEnabled) {
      void initFirebaseAnalytics();
    }
  }, [firebaseEnabled]);

  useEffect(() => {
    if (!firebaseEnabled) {
      try {
        const rawState = window.localStorage.getItem(STORAGE_KEY);

        if (rawState) {
          const parsed = JSON.parse(rawState) as LocalFallbackState;
          setUser(parsed.user);
          setCityState(parsed.city);
          setStats(parsed.stats ?? defaultUserStats);
        }
      } finally {
        setHydrated(true);
      }
      return;
    }

    const auth = getFirebaseAuth();
    const db = getFirebaseDb();

    if (!auth || !db) {
      setHydrated(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setCityState(null);
        setStats(defaultUserStats);
        setHydrated(true);
        return;
      }

      const mappedUser = mapFirebaseUserToAppUser(firebaseUser);
      setUser(mappedUser);

      try {
        const profile = await ensureUserProfile(db, mappedUser);
        setCityState(profile.city);
        setStats(profile.stats ?? defaultUserStats);
      } finally {
        setHydrated(true);
      }
    });

    return () => unsubscribe();
  }, [firebaseEnabled]);

  useEffect(() => {
    if (!hydrated || firebaseEnabled) {
      return;
    }

    const nextState: LocalFallbackState = { user, city, stats };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }, [city, firebaseEnabled, hydrated, stats, user]);

  async function login(credentials: { email: string; password: string }) {
    if (!firebaseEnabled) {
      setUser({
        uid: "local-user",
        name: "Player",
        email: credentials.email
      });
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error("Firebase auth is not available.");
    }

    await loginWithEmailPassword(auth, credentials.email, credentials.password);
  }

  async function signup(payload: { name: string; email: string; password: string }) {
    if (!firebaseEnabled) {
      setUser({
        uid: "local-user",
        name: payload.name || "Player",
        email: payload.email
      });
      return;
    }

    const auth = getFirebaseAuth();
    const db = getFirebaseDb();

    if (!auth || !db) {
      throw new Error("Firebase services are not available.");
    }

    const firebaseUser = await signupWithEmailPassword(auth, payload.name, payload.email, payload.password);
    const mappedUser = mapFirebaseUserToAppUser(firebaseUser);
    await ensureUserProfile(db, mappedUser);
  }

  async function logout() {
    if (!firebaseEnabled) {
      setUser(null);
      setCityState(null);
      setStats(defaultUserStats);
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      return;
    }

    await logoutFirebase(auth);
  }

  async function forgotPassword(email: string) {
    if (!firebaseEnabled) {
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error("Firebase auth is not available.");
    }

    await sendPasswordReset(auth, email);
  }

  async function setCity(nextCity: SupportedCity) {
    setCityState(nextCity);

    if (!firebaseEnabled || !user) {
      return;
    }

    const db = getFirebaseDb();
    if (!db) {
      return;
    }

    await updateUserCity(db, user.uid, nextCity);
  }

  async function recordGameResult(mode: GameModeKey, score: number) {
    if (score <= 0) {
      return;
    }

    setStats((currentStats) => ({
      ...currentStats,
      totalScore: currentStats.totalScore + score,
      xp: currentStats.xp + score * 10,
      modeScores: {
        ...currentStats.modeScores,
        [mode]: currentStats.modeScores[mode] + score
      }
    }));

    if (!firebaseEnabled || !user) {
      return;
    }

    const db = getFirebaseDb();
    if (!db) {
      return;
    }

    await persistGameResult(db, user.uid, mode, score);

    const profile = await ensureUserProfile(db, user);
    setStats(profile.stats ?? defaultUserStats);
  }

  const value = useMemo<AppContextValue>(
    () => ({
      hydrated,
      firebaseEnabled,
      user,
      city,
      stats,
      login,
      signup,
      forgotPassword,
      logout,
      setCity,
      recordGameResult
    }),
    [city, firebaseEnabled, hydrated, stats, user]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within AppProvider.");
  }

  return context;
}
