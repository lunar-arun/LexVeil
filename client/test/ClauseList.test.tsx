import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ClauseList } from "../src/components/ClauseList";
import type { Clause } from "../src/types";

const clauses: Clause[] = [
  {
    id: "c1",
    index: 1,
    text: "Full original clause text about termination.",
    category: "termination",
    risk: "high",
    plainLanguage: "You can be charged a fee for ending early.",
    rationale: "Financial penalty.",
    confidence: 0.8
  },
  {
    id: "c2",
    index: 2,
    text: "Full original clause text about rent.",
    category: "fees_and_payments",
    risk: "low",
    plainLanguage: "Rent is due monthly.",
    rationale: "Standard obligation.",
    confidence: 0.9
  },
  {
    id: "c3",
    index: 3,
    text: "Ambiguous clause text.",
    category: "other",
    risk: "info",
    plainLanguage: "Unclear provision.",
    rationale: "Not clearly categorized.",
    confidence: 0.3
  }
];

describe("ClauseList", () => {
  it("renders all clauses by default", () => {
    render(<ClauseList clauses={clauses} />);
    expect(screen.getByText(/clauses \(3 of 3\)/i)).toBeInTheDocument();
  });

  it("filters clauses by risk level", async () => {
    const user = userEvent.setup();
    render(<ClauseList clauses={clauses} />);

    await user.click(screen.getByRole("button", { name: "High risk" }));
    expect(screen.getByText(/clauses \(1 of 3\)/i)).toBeInTheDocument();
  });

  it("flags low-confidence clauses for the user", () => {
    render(<ClauseList clauses={clauses} />);
    expect(screen.getByText("Low confidence")).toBeInTheDocument();
  });

  it("shows an empty state when there are no clauses", () => {
    render(<ClauseList clauses={[]} />);
    expect(screen.getByText(/no clauses could be identified/i)).toBeInTheDocument();
  });
});
