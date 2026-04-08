import { render, screen } from "@testing-library/react";
import { HomeHero } from "./HomeHero";

describe("HomeHero", () => {
  it("renders the main heading and primary actions", () => {
    render(<HomeHero />);

    expect(screen.getByRole("heading", { name: /learn chennai like a local/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start playing/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /view modes/i })).toBeInTheDocument();
  });
});
