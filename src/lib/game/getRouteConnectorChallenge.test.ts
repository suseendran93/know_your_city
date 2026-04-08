import type { PlaceResult } from "@/types/location";
import { getRouteConnectorChallenge } from "./getRouteConnectorChallenge";

const placeA: PlaceResult = {
  id: "a",
  name: "Adyar",
  fullAddress: "Adyar",
  lat: 13.0012,
  lng: 80.2565
};

const placeB: PlaceResult = {
  id: "b",
  name: "Porur",
  fullAddress: "Porur",
  lat: 13.035,
  lng: 80.158
};

describe("getRouteConnectorChallenge", () => {
  it("returns 2-3 expected connectors", () => {
    const challenge = getRouteConnectorChallenge(placeA, placeB);

    expect(challenge.expectedConnectors.length).toBeGreaterThanOrEqual(2);
    expect(challenge.expectedConnectors.length).toBeLessThanOrEqual(3);
  });

  it("includes expected connectors in options", () => {
    const challenge = getRouteConnectorChallenge(placeA, placeB);

    for (const expected of challenge.expectedConnectors) {
      expect(challenge.connectorOptions.some((option) => option.id === expected.id)).toBe(true);
    }
  });

  it("uses Bengaluru connector catalog when city is Bangalore", () => {
    const challenge = getRouteConnectorChallenge(placeA, placeB, "Bangalore");
    const chennaiConnectorIds = new Set(["omr", "ecr", "gst", "irr", "mount", "poona", "hundred-feet", "sardar", "arcot"]);

    expect(challenge.connectorOptions.length).toBeGreaterThan(0);
    expect(
      challenge.connectorOptions.some((connector) => chennaiConnectorIds.has(connector.id))
    ).toBe(false);
  });
});
