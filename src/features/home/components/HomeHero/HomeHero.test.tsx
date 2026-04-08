import { render, screen } from "@testing-library/react";
import { HomeHero } from "./HomeHero";

describe("HomeHero", () => {
  it("renders the main heading and primary actions", () => {
    render(
      <HomeHero
        content={{
          badge: "Know Your Chennai",
          title: "Learn Chennai like a local.",
          description: "Test description",
          panelLabel: "Today's focus",
          panelTitle: "3 quick ways to learn the city",
          panelItems: ["One", "Two", "Three"]
        }}
        actions={{
          startPlaying: "Start Playing",
          viewModes: "View Modes"
        }}
      />
    );

    expect(screen.getByRole("heading", { name: /learn chennai like a local/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start playing/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view modes/i })).toBeInTheDocument();
  });
});
