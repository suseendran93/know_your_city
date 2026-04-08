import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  type Firestore
} from "firebase/firestore";
import type { AppUser, GameModeKey, SupportedCity, UserStats } from "@/types/app";

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  city: SupportedCity | null;
  stats: UserStats;
  createdAt?: unknown;
  updatedAt?: unknown;
};

const emptyStats: UserStats = {
  totalScore: 0,
  xp: 0,
  streak: 0,
  lastPlayedDate: null,
  modeScores: {
    directionMode: 0,
    routeMode: 0,
    mapPinMode: 0
  }
};

function userRef(db: Firestore, uid: string) {
  return doc(db, "users", uid);
}

export async function ensureUserProfile(db: Firestore, user: AppUser): Promise<UserProfile> {
  const ref = userRef(db, user.uid);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    const data = snapshot.data() as UserProfile;
    return {
      uid: user.uid,
      name: data.name ?? user.name,
      email: data.email ?? user.email,
      city: data.city ?? null,
      stats: {
        ...emptyStats,
        ...(data.stats ?? {})
      }
    };
  }

  const profile: UserProfile = {
    uid: user.uid,
    name: user.name || "Player",
    email: user.email,
    city: null,
    stats: emptyStats
  };

  await setDoc(ref, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return profile;
}

export async function updateUserCity(db: Firestore, uid: string, city: SupportedCity) {
  await setDoc(
    userRef(db, uid),
    {
      city,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

function getDateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function getPreviousDateStamp() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

export async function recordGameResult(db: Firestore, uid: string, mode: GameModeKey, score: number) {
  const ref = userRef(db, uid);
  const today = getDateStamp();
  const previousDay = getPreviousDateStamp();

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.exists() ? (snapshot.data() as UserProfile) : null;
    const stats = {
      ...emptyStats,
      ...(data?.stats ?? {})
    };

    let nextStreak = stats.streak || 0;

    if (stats.lastPlayedDate === today) {
      nextStreak = stats.streak || 1;
    } else if (stats.lastPlayedDate === previousDay) {
      nextStreak = (stats.streak || 0) + 1;
    } else {
      nextStreak = 1;
    }

    const nextModeScores = {
      ...emptyStats.modeScores,
      ...(stats.modeScores ?? {}),
      [mode]: (stats.modeScores?.[mode] ?? 0) + score
    };

    transaction.set(
      ref,
      {
        stats: {
          totalScore: (stats.totalScore ?? 0) + score,
          xp: (stats.xp ?? 0) + Math.max(score, 0) * 10,
          streak: nextStreak,
          lastPlayedDate: today,
          modeScores: nextModeScores
        },
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  });
}

export { emptyStats as defaultUserStats };
