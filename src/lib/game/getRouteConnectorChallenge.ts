import type { PlaceResult } from "@/types/location";

export type RouteConnector = {
  id: string;
  name: string;
};

export type RouteConnectorChallenge = {
  expectedConnectors: RouteConnector[];
  connectorOptions: RouteConnector[];
};

const connectorCatalog: RouteConnector[] = [
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

function getById(id: string) {
  return connectorCatalog.find((connector) => connector.id === id);
}

function pickHeuristicConnectors(from: PlaceResult, to: PlaceResult) {
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

  const unique = Array.from(new Set(picks));
  const trimmed = unique.slice(0, 3);

  if (trimmed.length < 2) {
    trimmed.push("mount");
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

export function getRouteConnectorChallenge(from: PlaceResult, to: PlaceResult): RouteConnectorChallenge {
  const expectedIds = pickHeuristicConnectors(from, to);
  const expectedConnectors = expectedIds
    .map((connectorId) => getById(connectorId))
    .filter((connector): connector is RouteConnector => Boolean(connector));

  const filler = connectorCatalog.filter(
    (connector) => !expectedConnectors.some((expected) => expected.id === connector.id)
  );

  const connectorOptions = shuffle([...expectedConnectors, ...shuffle(filler).slice(0, 3)]).slice(0, 6);

  return {
    expectedConnectors,
    connectorOptions
  };
}
