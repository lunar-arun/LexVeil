import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UploadPanel } from "../src/components/UploadPanel";

function makeFile(name: string, type: string, sizeBytes = 100) {
  const file = new File(["x".repeat(sizeBytes)], name, { type });
  return file;
}

describe("UploadPanel", () => {
  it("disables the submit button until a valid file is chosen", async () => {
    render(<UploadPanel onUpload={vi.fn()} isUploading={false} />);
    expect(screen.getByRole("button", { name: /analyze document/i })).toBeDisabled();
  });

  it("shows a validation error and keeps submit disabled for unsupported file types", async () => {
    render(<UploadPanel onUpload={vi.fn()} isUploading={false} />);

    const input = screen.getByLabelText(/document file/i);
    // fireEvent bypasses user-event's own `accept` filtering so we can
    // exercise the component's own validation logic directly.
    fireEvent.change(input, { target: { files: [makeFile("photo.png", "image/png")] } });

    expect(await screen.findByRole("alert")).toHaveTextContent(/only pdf or plain text/i);
    expect(screen.getByRole("button", { name: /analyze document/i })).toBeDisabled();
  });

  it("enables submit and calls onUpload for a valid file", async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    render(<UploadPanel onUpload={onUpload} isUploading={false} />);

    const input = screen.getByLabelText(/document file/i);
    await user.upload(input, makeFile("lease.txt", "text/plain"));

    const button = screen.getByRole("button", { name: /analyze document/i });
    await waitFor(() => expect(button).toBeEnabled());

    await user.click(button);
    expect(onUpload).toHaveBeenCalledTimes(1);
  });

  it("shows a busy label while uploading", () => {
    render(<UploadPanel onUpload={vi.fn()} isUploading={true} />);
    expect(screen.getByRole("button", { name: /analyzing document/i })).toBeInTheDocument();
  });
});
