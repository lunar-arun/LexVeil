import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChatPanel } from "../src/components/ChatPanel";

describe("ChatPanel", () => {
  it("disables the ask button when the input is empty", () => {
    render(<ChatPanel chatHistory={[]} clauses={[]} onAsk={vi.fn()} isSending={false} error={null} />);
    expect(screen.getByRole("button", { name: /ask/i })).toBeDisabled();
  });

  it("calls onAsk with the trimmed question and clears the input", async () => {
    const user = userEvent.setup();
    const onAsk = vi.fn().mockResolvedValue(undefined);
    render(<ChatPanel chatHistory={[]} clauses={[]} onAsk={onAsk} isSending={false} error={null} />);

    const input = screen.getByLabelText(/ask a question about this document/i);
    await user.type(input, "  What happens if I terminate early?  ");
    await user.click(screen.getByRole("button", { name: /ask/i }));

    expect(onAsk).toHaveBeenCalledWith("What happens if I terminate early?");
    expect(input).toHaveValue("");
  });

  it("renders low-confidence warnings on assistant messages", () => {
    render(
      <ChatPanel
        chatHistory={[
          {
            role: "assistant",
            content: "I'm not sure based on this document.",
            lowConfidence: true,
            createdAt: new Date().toISOString()
          }
        ]}
        clauses={[]}
        onAsk={vi.fn()}
        isSending={false}
        error={null}
      />
    );
    expect(screen.getByText(/low confidence/i)).toBeInTheDocument();
  });

  it("shows an error message when provided", () => {
    render(<ChatPanel chatHistory={[]} clauses={[]} onAsk={vi.fn()} isSending={false} error="Network error" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Network error");
  });
});
