import type { PlaceResult } from "@/types/location";
import type { RouteResult } from "@/types/location";

export type RouteConnector = {
  id: string;
  name: string;
};

export type RouteConnectorChallenge = {
  expectedConnectors: RouteConnector[];
  connectorOptions: RouteConnector[];
};

type SupportedConnectorCity = "Chennai" | "Bengaluru";

const chennaiConnectorCatalog: RouteConnector[] = [
  { id: "omr", name: "OMR" },
  { id: "ecr", name: "ECR" },
  { id: "gst", name: "GST Road" },
  { id: "irr", name: "Inner Ring Road" },
  { id: "mount", name: "Anna Salai (Mount Road)" },
  { id: "poona", name: "Poonamallee High Road" },
  { id: "hundred-feet", name: "100 Feet Road" },
  { id: "sardar", name: "Sardar Patel Road" },
  { id: "arcot", name: "Arcot Road" }
];

const bengaluruConnectorCatalog: RouteConnector[] = [
  { id: "orr", name: "Outer Ring Road" },
  { id: "nice", name: "NICE Road" },
  { id: "hosur", name: "Hosur Road" },
  { id: "mysore", name: "Mysore Road" },
  { id: "tumkur", name: "Tumkur Road" },
  { id: "old-madras", name: "Old Madras Road" },
  { id: "bannerghatta", name: "Bannerghatta Road" },
  { id: "kanakapura", name: "Kanakapura Road" },
  { id: "airport", name: "Bellary Road (Airport Road)" }
];

function normalizeConnectorCity(cityName: string): SupportedConnectorCity {
  const normalized = cityName.trim().toLowerCase();

  if (normalized === "bangalore" || normalized === "bengaluru") {
    return "Bengaluru";
  }

  return "Chennai";
}

function getCatalog(cityName: string) {
  const city = normalizeConnectorCity(cityName);

  return city === "Bengaluru" ? bengaluruConnectorCatalog : chennaiConnectorCatalog;
}

function getById(id: string, catalog: RouteConnector[]) {
  return catalog.find((connector) => connector.id === id);
}

type RouteSignals = {
  latDelta: number;
  lngDelta: number;
  spanLat: number;
  spanLng: number;
  routeDistanceMeters: number;
};

function getRouteSignals(from: PlaceResult, to: PlaceResult, route: RouteResult | null): RouteSignals {
  if (!route || route.geometry.length === 0) {
    const lngDelta = to.lng - from.lng;
    const latDelta = to.lat - from.lat;
    return {
      latDelta,
      lngDelta,
      spanLat: Math.abs(latDelta),
      spanLng: Math.abs(lngDelta),
      routeDistanceMeters: Math.hypot(latDelta, lngDelta) * 111000
    };
  }

  const lats = route.geometry.map((point) => point.lat);
  const lngs = route.geometry.map((point) => point.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const firstPoint = route.geometry[0];
  const lastPoint = route.geometry[route.geometry.length - 1];

  return {
    latDelta: lastPoint.lat - firstPoint.lat,
    lngDelta: lastPoint.lng - firstPoint.lng,
    spanLat: maxLat - minLat,
    spanLng: maxLng - minLng,
    routeDistanceMeters: route.distanceMeters
  };
}

function pickChennaiHeuristicConnectors(from: PlaceResult, to: PlaceResult, signals: RouteSignals) {
  const { lngDelta, latDelta, spanLat, spanLng, routeDistanceMeters } = signals;
  const picks: string[] = ["irr"];

  if (spanLat > 0.06 || Math.abs(latDelta) > 0.06) {
    picks.push("gst");
  }

  if (spanLng > 0.08 || Math.abs(lngDelta) > 0.08) {
    picks.push("hundred-feet");
  }

  if (from.lng > 80.21 || to.lng > 80.21) {
    picks.push("omr");
  }

  if (from.lng > 80.25 || to.lng > 80.25) {
    picks.push("ecr");
  }

  if (from.lng < 80.16 || to.lng < 80.16) {
    picks.push("poona");
  }

  if (routeDistanceMeters > 18000) {
    picks.push("mount");
  } else {
    picks.push("sardar");
  }

  return picks;
}

function pickBengaluruHeuristicConnectors(from: PlaceResult, to: PlaceResult, signals: RouteSignals) {
  const { lngDelta, latDelta, spanLat, spanLng, routeDistanceMeters } = signals;
  const picks: string[] = ["orr"];

  if (spanLat > 0.06 || Math.abs(latDelta) > 0.06) {
    picks.push("hosur");
  }

  if (spanLng > 0.08 || Math.abs(lngDelta) > 0.08) {
    picks.push("old-madras");
  }

  if (from.lng < 77.52 || to.lng < 77.52) {
    picks.push("nice");
  }

  if (from.lat > 13.1 || to.lat > 13.1) {
    picks.push("airport");
  }

  if (routeDistanceMeters > 18000) {
    picks.push("tumkur");
  } else {
    picks.push("bannerghatta");
  }

  return picks;
}

function pickHeuristicConnectors(
  from: PlaceResult,
  to: PlaceResult,
  cityName: string,
  route: RouteResult | null
) {
  const city = normalizeConnectorCity(cityName);
  const signals = getRouteSignals(from, to, route);
  const candidatePicks =
    city === "Bengaluru"
      ? pickBengaluruHeuristicConnectors(from, to, signals)
      : pickChennaiHeuristicConnectors(from, to, signals);

  const unique = Array.from(new Set(candidatePicks));
  const trimmed = unique.slice(0, 3);

  if (trimmed.length < 2) {
    trimmed.push(city === "Bengaluru" ? "kanakapura" : "mount");
  }

  return trimmed;
}

function shuffle<T>(values: T[]) {
  const next = [...values];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[randomIndex];
    next[randomIndex] = current;
  }

  return next;
}

export function getRouteConnectorChallenge(
  from: PlaceResult,
  to: PlaceResult,
  cityName = "Chennai",
  route: RouteResult | null = null
): RouteConnectorChallenge {
  const catalog = getCatalog(cityName);
  const expectedIds = pickHeuristicConnectors(from, to, cityName, route);
  const expectedConnectors = expectedIds
    .map((connectorId) => getById(connectorId, catalog))
    .filter((connector): connector is RouteConnector => Boolean(connector));

  const filler = catalog.filter(
    (connector) => !expectedConnectors.some((expected) => expected.id === connector.id)
  );

  const connectorOptions = shuffle([...expectedConnectors, ...shuffle(filler).slice(0, 3)]).slice(0, 6);

  return {
    expectedConnectors,
    connectorOptions
  };
}
