import { fireEvent, render, screen } from "@testing-library/react";
import { getMessages } from "@/lib/i18n";
import { RouteModeScreen } from "./RouteModeScreen";

describe("RouteModeScreen", () => {
  const messages = getMessages();

  it("renders basic route mode controls", () => {
    render(
      <RouteModeScreen
        cityName="Chennai"
        content={messages.routeMode}
        actions={messages.common.actions}
        status={messages.common.status}
      />
    );

    expect(screen.getByRole("heading", { name: /build a connector path/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /build route challenge/i })).toBeDisabled();
  });

  it("keeps loading state hidden for single-character input", () => {
    render(
      <RouteModeScreen
        cityName="Chennai"
        content={messages.routeMode}
        actions={messages.common.actions}
        status={messages.common.status}
      />
    );

    const inputs = screen.getAllByPlaceholderText(/search a place in/i);
    fireEvent.change(inputs[0], { target: { value: "a" } });

    expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
  });
});
