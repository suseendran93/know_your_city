"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AppUser, SupportedCity } from "@/types/app";

type AppContextValue = {
  hydrated: boolean;
  user: AppUser | null;
  city: SupportedCity | null;
  login: (user: AppUser) => void;
  signup: (user: AppUser) => void;
  logout: () => void;
  setCity: (city: SupportedCity) => void;
};

const STORAGE_KEY = "kyc_app_state_v1";

const AppContext = createContext<AppContextValue | null>(null);

type PersistedState = {
  user: AppUser | null;
  city: SupportedCity | null;
};

type AppProviderProps = {
  children: React.ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [city, setCityState] = useState<SupportedCity | null>(null);

  useEffect(() => {
    try {
      const rawState = window.localStorage.getItem(STORAGE_KEY);

      if (rawState) {
        const parsed = JSON.parse(rawState) as PersistedState;
        setUser(parsed.user);
        setCityState(parsed.city);
      }
    } catch {
      setUser(null);
      setCityState(null);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const nextState: PersistedState = { user, city };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }, [city, hydrated, user]);

  const value = useMemo<AppContextValue>(
    () => ({
      hydrated,
      user,
      city,
      login: (nextUser) => setUser(nextUser),
      signup: (nextUser) => setUser(nextUser),
      logout: () => {
        setUser(null);
        setCityState(null);
      },
      setCity: (nextCity) => setCityState(nextCity)
    }),
    [city, hydrated, user]
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
