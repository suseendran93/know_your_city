import { render, screen } from "@testing-library/react";
import { getMessages } from "@/lib/i18n";
import { MapPinModeScreen } from "./MapPinModeScreen";

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
