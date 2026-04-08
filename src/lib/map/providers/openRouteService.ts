import { OPENROUTESERVICE_BASE_URL } from "@/lib/map/constants";
import { fetchJson } from "@/lib/map/request";
import type { RoutePoint, RouteResult } from "@/types/location";

type OpenRouteServiceFeature = {
  geometry: {
    coordinates: number[][];
  };
  properties: {
    summary: {
      distance: number;
      duration: number;
    };
  };
};

type OpenRouteServiceResponse = {
  features: OpenRouteServiceFeature[];
};

function mapGeometry(coordinates: number[][]): RoutePoint[] {
  return coordinates.map(([lng, lat]) => ({
    lat,
    lng
  }));
}

export async function getRoute(start: RoutePoint, end: RoutePoint): Promise<RouteResult> {
  const apiKey = process.env.OPENROUTESERVICE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENROUTESERVICE_API_KEY");
  }

  const response = await fetchJson<OpenRouteServiceResponse>(
    `${OPENROUTESERVICE_BASE_URL}/v2/directions/driving-car/geojson`,
    {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat]
        ]
      }),
      cache: "no-store"
    }
  );

  const firstFeature = response.features[0];

  if (!firstFeature) {
    throw new Error("Route not found");
  }

  return {
    distanceMeters: firstFeature.properties.summary.distance,
    durationSeconds: firstFeature.properties.summary.duration,
    geometry: mapGeometry(firstFeature.geometry.coordinates)
  };
}
