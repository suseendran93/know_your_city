import { fireEvent, render, screen } from "@testing-library/react";
import { getMessages } from "@/lib/i18n";
import { DirectionModeScreen } from "./DirectionModeScreen";

describe("DirectionModeScreen", () => {
  const messages = getMessages();

  it("renders the setup UI and keeps the start button disabled initially", () => {
    render(
      <DirectionModeScreen
        cityName="Chennai"
        content={messages.directionMode}
        actions={messages.common.actions}
        status={messages.common.status}
      />
    );

    expect(screen.getByRole("heading", { name: /pick two real places and play five quick questions/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start 5 questions/i })).toBeDisabled();
  });

  it("does not show a searching state before typing enough text", () => {
    render(
      <DirectionModeScreen
        cityName="Chennai"
        content={messages.directionMode}
        actions={messages.common.actions}
        status={messages.common.status}
      />
    );

    const inputs = screen.getAllByPlaceholderText(/search a place in/i);
    fireEvent.change(inputs[0], { target: { value: "a" } });

    expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
  });

  it("does not render duplicate loading states on first paint", () => {
    render(
      <DirectionModeScreen
        cityName="Chennai"
        content={messages.directionMode}
        actions={messages.common.actions}
        status={messages.common.status}
      />
    );

    expect(screen.queryAllByText(/searching/i)).toHaveLength(0);
  });
});
