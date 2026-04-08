import type { PlaceResult } from "@/types/location";

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

function pickChennaiHeuristicConnectors(from: PlaceResult, to: PlaceResult) {
  const lngDelta = to.lng - from.lng;
  const latDelta = to.lat - from.lat;
  const distanceMagnitude = Math.hypot(latDelta, lngDelta);
  const picks: string[] = ["irr"];

  if (Math.abs(latDelta) > 0.06) {
    picks.push("gst");
  }

  if (Math.abs(lngDelta) > 0.08) {
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

  if (distanceMagnitude > 0.15) {
    picks.push("mount");
  } else {
    picks.push("sardar");
  }

  return picks;
}

function pickBengaluruHeuristicConnectors(from: PlaceResult, to: PlaceResult) {
  const lngDelta = to.lng - from.lng;
  const latDelta = to.lat - from.lat;
  const distanceMagnitude = Math.hypot(latDelta, lngDelta);
  const picks: string[] = ["orr"];

  if (Math.abs(latDelta) > 0.06) {
    picks.push("hosur");
  }

  if (Math.abs(lngDelta) > 0.08) {
    picks.push("old-madras");
  }

  if (from.lng < 77.52 || to.lng < 77.52) {
    picks.push("nice");
  }

  if (from.lat > 13.1 || to.lat > 13.1) {
    picks.push("airport");
  }

  if (distanceMagnitude > 0.15) {
    picks.push("tumkur");
  } else {
    picks.push("bannerghatta");
  }

  return picks;
}

function pickHeuristicConnectors(from: PlaceResult, to: PlaceResult, cityName: string) {
  const city = normalizeConnectorCity(cityName);
  const candidatePicks =
    city === "Bengaluru"
      ? pickBengaluruHeuristicConnectors(from, to)
      : pickChennaiHeuristicConnectors(from, to);

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
  cityName = "Chennai"
): RouteConnectorChallenge {
  const catalog = getCatalog(cityName);
  const expectedIds = pickHeuristicConnectors(from, to, cityName);
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
