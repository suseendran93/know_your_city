import { render, screen } from "@testing-library/react";
import { HomeHero } from "./HomeHero";

describe("HomeHero", () => {
  it("renders the main heading and primary actions", () => {
    render(<HomeHero />);

    expect(screen.getByRole("heading", { name: /learn chennai like a local/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start playing/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view modes/i })).toBeInTheDocument();
  });
});
