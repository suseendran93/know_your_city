export type SupportedCity = "Chennai" | "Bangalore";

export type AppUser = {
  uid: string;
  name: string;
  email: string;
};

export type GameModeKey = "directionMode" | "routeMode" | "mapPinMode";

export type UserStats = {
  totalScore: number;
  xp: number;
  streak: number;
  lastPlayedDate: string | null;
  modeScores: Record<GameModeKey, number>;
};
