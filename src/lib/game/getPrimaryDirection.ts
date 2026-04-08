import type { PlaceResult } from "@/types/location";

export type DirectionAnswer = "North" | "South" | "East" | "West";

export function getPrimaryDirection(from: PlaceResult, to: PlaceResult): DirectionAnswer {
  const latDelta = to.lat - from.lat;
  const lngDelta = to.lng - from.lng;

  if (Math.abs(latDelta) >= Math.abs(lngDelta)) {
    return latDelta >= 0 ? "North" : "South";
  }

  return lngDelta >= 0 ? "East" : "West";
}
