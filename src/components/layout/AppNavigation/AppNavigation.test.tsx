import { render, screen } from "@testing-library/react";
import { AppNavigation } from "./AppNavigation";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    back: jest.fn()
  })
}));

describe("AppNavigation", () => {
  it("renders home and back actions", () => {
    render(<AppNavigation homeLabel="Home" backLabel="Back" ariaLabel="Navigation" />);

    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });
});
