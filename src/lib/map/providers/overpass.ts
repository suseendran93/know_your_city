import { OVERPASS_BASE_URL } from "@/lib/map/constants";
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
    [out:json][timeout:25];
    (
      node(around:${radiusMeters},${lat},${lng})["name"];
      way(around:${radiusMeters},${lat},${lng})["name"];
      relation(around:${radiusMeters},${lat},${lng})["name"];
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

export async function getNearbyPlaces(lat: number, lng: number, radiusMeters = 1500, limit = 20) {
  const body = buildNearbyQuery(lat, lng, radiusMeters, limit);

  const response = await fetchJson<OverpassResponse>(OVERPASS_BASE_URL, {
    method: "POST",
    headers: {
      ...getAppIdentityHeaders(),
      "Content-Type": "text/plain"
    },
    body,
    next: { revalidate: 3600 }
  });

  return response.elements
    .map(mapNearbyPlace)
    .filter((place): place is NearbyPlaceResult => place !== null)
    .slice(0, limit);
}
