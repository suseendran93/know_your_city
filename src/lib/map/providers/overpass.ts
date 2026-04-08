import { OVERPASS_BASE_URL, OVERPASS_FALLBACK_BASE_URLS } from "@/lib/map/constants";
import { fetchJson, getAppIdentityHeaders } from "@/lib/map/request";
import type { NearbyPlaceResult } from "@/types/location";

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements: OverpassElement[];
};

function buildNearbyQuery(lat: number, lng: number, radiusMeters: number, limit: number) {
  return `
    [out:json][timeout:12];
    (
      node(around:${radiusMeters},${lat},${lng})["name"]["place"];
      way(around:${radiusMeters},${lat},${lng})["name"]["place"];
      relation(around:${radiusMeters},${lat},${lng})["name"]["place"];
      node(around:${radiusMeters},${lat},${lng})["name"]["amenity"];
      node(around:${radiusMeters},${lat},${lng})["name"]["tourism"];
      node(around:${radiusMeters},${lat},${lng})["name"]["leisure"];
      node(around:${radiusMeters},${lat},${lng})["name"]["shop"];
      node(around:${radiusMeters},${lat},${lng})["name"]["highway"];
    );
    out center ${limit};
  `;
}

function mapNearbyPlace(element: OverpassElement): NearbyPlaceResult | null {
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }

  return {
    id: String(element.id),
    name: element.tags?.name ?? "Unknown place",
    fullAddress: element.tags?.["addr:full"] ?? element.tags?.name ?? "Unknown place",
    lat,
    lng,
    category: element.tags?.amenity ?? element.tags?.highway ?? element.tags?.tourism,
    city: element.tags?.["addr:city"],
    state: element.tags?.["addr:state"],
    country: element.tags?.["addr:country"]
  };
}

async function requestNearbyPlaces(url: string, body: string) {
  return fetchJson<OverpassResponse>(url, {
    method: "POST",
    headers: {
      ...getAppIdentityHeaders(),
      "Content-Type": "text/plain"
    },
    body,
    next: { revalidate: 3600 },
    timeoutMs: 15000
  });
}

export async function getNearbyPlaces(lat: number, lng: number, radiusMeters = 1500, limit = 20) {
  const body = buildNearbyQuery(lat, lng, radiusMeters, limit);
  const endpoints = [OVERPASS_BASE_URL, ...OVERPASS_FALLBACK_BASE_URLS];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await requestNearbyPlaces(endpoint, body);

      return response.elements
        .map(mapNearbyPlace)
        .filter((place): place is NearbyPlaceResult => place !== null)
        .filter(
          (place, index, places) =>
            places.findIndex((candidate) => candidate.name.trim().toLowerCase() === place.name.trim().toLowerCase()) ===
            index
        )
        .slice(0, limit);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Failed to fetch nearby places.");
    }
  }

  throw lastError ?? new Error("Failed to fetch nearby places.");
}
