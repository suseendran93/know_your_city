import type { PlaceResult } from "@/types/location";
import { getPrimaryDirection } from "./getPrimaryDirection";

const basePlace: PlaceResult = {
  id: "1",
  name: "Base",
  fullAddress: "Base",
  lat: 0,
  lng: 0
};

describe("getPrimaryDirection", () => {
  it("returns North when latitude delta is dominant and positive", () => {
    expect(
      getPrimaryDirection(basePlace, {
        ...basePlace,
        id: "2",
        lat: 5,
        lng: 1
      })
    ).toBe("North");
  });

  it("returns West when longitude delta is dominant and negative", () => {
    expect(
      getPrimaryDirection(basePlace, {
        ...basePlace,
        id: "3",
        lat: 1,
        lng: -6
      })
    ).toBe("West");
  });
});
