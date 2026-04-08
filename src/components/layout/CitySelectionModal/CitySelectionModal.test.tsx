import { render, screen } from "@testing-library/react";
import { CitySelectionModal } from "./CitySelectionModal";

jest.mock("@/components/providers/AppProvider/AppProvider", () => ({
  useAppContext: () => ({
    hydrated: true,
    firebaseEnabled: true,
    user: { name: "Test User", email: "test@example.com" },
    city: null,
    stats: {
      totalScore: 0,
      xp: 0,
      streak: 0,
      lastPlayedDate: null,
      modeScores: {
        directionMode: 0,
        routeMode: 0,
        mapPinMode: 0
      }
    },
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
    setCity: jest.fn(),
    recordGameResult: jest.fn()
  })
}));

describe("CitySelectionModal", () => {
  it("renders city modal for first-time users", () => {
    render(
      <CitySelectionModal
        title="Select your city"
        description="Required before playing."
        selectLabel="City"
        saveLabel="Save City"
        options={[
          { value: "Chennai", label: "Chennai" },
          { value: "Bangalore", label: "Bangalore" }
        ]}
      />
    );

    expect(screen.getByRole("heading", { name: /select your city/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save city/i })).toBeDisabled();
  });
});
