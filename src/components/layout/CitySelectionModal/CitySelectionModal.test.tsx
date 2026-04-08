import { render, screen } from "@testing-library/react";
import { CitySelectionModal } from "./CitySelectionModal";

jest.mock("@/components/providers/AppProvider/AppProvider", () => ({
  useAppContext: () => ({
    hydrated: true,
    user: { name: "Test User", email: "test@example.com" },
    city: null,
    setCity: jest.fn()
  })
}));

describe("CitySelectionModal", () => {
  it("renders city modal for first-time users", () => {
    render(
      <CitySelectionModal
        title="Select your city"
        description="Required before playing."
        selectLabel="City"
        saveLabel="Save City"
        options={[
          { value: "Chennai", label: "Chennai" },
          { value: "Bangalore", label: "Bangalore" }
        ]}
      />
    );

    expect(screen.getByRole("heading", { name: /select your city/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save city/i })).toBeDisabled();
  });
});
