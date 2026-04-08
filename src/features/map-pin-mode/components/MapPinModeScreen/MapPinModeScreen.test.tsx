import { render, screen } from "@testing-library/react";
import { getMessages } from "@/lib/i18n";
import { MapPinModeScreen } from "./MapPinModeScreen";

jest.mock("@/components/providers/AppProvider/AppProvider", () => ({
  useAppContext: () => ({
    hydrated: true,
    firebaseEnabled: false,
    user: null,
    city: "Chennai",
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

describe("MapPinModeScreen", () => {
  const messages = getMessages();

  it("renders initial map pin mode content", () => {
    render(
      <MapPinModeScreen
        cityName="Chennai"
        content={messages.mapPinMode}
        actions={messages.common.actions}
      />
    );

    expect(screen.getByRole("heading", { name: /find places by pinning the map/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start round/i })).toBeInTheDocument();
  });
});
