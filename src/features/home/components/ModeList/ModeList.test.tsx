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
            openMode: "Open Mode",
            comingSoon: "Coming soon"
          },
          items: [
            {
              title: "Direction Mode",
              description: "Guess the city direction between two places.",
              status: "Ready",
              path: "/direction-mode"
            },
            {
              title: "Map Pin Mode",
              description: "Tap the right location on the map.",
              status: "Next"
            }
          ]
        }}
      />
    );

    expect(screen.getByText(/direction mode/i)).toBeInTheDocument();
    expect(screen.getByText(/map pin mode/i)).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open mode/i })).toBeInTheDocument();
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });
});
