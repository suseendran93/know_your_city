import { render, screen } from "@testing-library/react";
import { ModeList } from "./ModeList";

describe("ModeList", () => {
  it("renders the provided game modes", () => {
    render(
      <ModeList
        content={{
          kicker: "Game modes",
          title: "Start simple. Learn steadily.",
          subtitle: "Subtitle",
          cta: {
            openMode: "Open Mode"
          },
          items: [
            {
              title: "Direction Mode",
              description: "Guess the city direction between two places.",
              path: "/direction-mode"
            },
            {
              title: "Map Pin Mode",
              description: "Tap the right location on the map.",
              path: "/map-pin-mode"
            }
          ]
        }}
      />
    );

    expect(screen.getByText(/direction mode/i)).toBeInTheDocument();
    expect(screen.getByText(/map pin mode/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /open mode/i })).toHaveLength(2);
  });
});
