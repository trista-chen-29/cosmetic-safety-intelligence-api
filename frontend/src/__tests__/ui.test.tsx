import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { RiskBadge } from "../components/RiskBadge";
import { SavedPage } from "../pages/Saved";
import { riskHeadline } from "../utils/format";

describe("risk level display", () => {
  it("uses a text label, not color alone", () => {
    render(<RiskBadge level="high" />);
    expect(screen.getByText("Likely expired")).toBeInTheDocument();
    expect(screen.getByText(/high concern based on the details provided/i)).toBeInTheDocument();
  });

  it("keeps distinct copy for each risk level", () => {
    expect(riskHeadline("low")).toMatch(/okay/i);
    expect(riskHeadline("medium")).toMatch(/carefully/i);
    expect(riskHeadline("high")).toMatch(/expired/i);
  });
});

describe("saved products empty state", () => {
  it("explains that saved products will appear later", () => {
    localStorage.clear();
    render(
      <MemoryRouter>
        <SavedPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/nothing has been saved yet/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /check a product/i })).toBeInTheDocument();
  });
});
