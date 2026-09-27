import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RiskBadge } from "../src/components/RiskBadge";

describe("RiskBadge", () => {
  it("renders both a text label and a visual symbol, not color alone", () => {
    render(<RiskBadge risk="high" />);
    expect(screen.getByText("High risk")).toBeInTheDocument();
  });

  it("renders distinct labels for each risk level", () => {
    const { rerender } = render(<RiskBadge risk="medium" />);
    expect(screen.getByText("Medium risk")).toBeInTheDocument();

    rerender(<RiskBadge risk="low" />);
    expect(screen.getByText("Low risk")).toBeInTheDocument();

    rerender(<RiskBadge risk="info" />);
    expect(screen.getByText("Informational")).toBeInTheDocument();
  });
});
