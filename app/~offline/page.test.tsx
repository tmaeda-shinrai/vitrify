import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import OfflinePage from "@/app/~offline/page";

describe("OfflinePage", () => {
  it("exibe a mensagem de sem conexão", () => {
    render(<OfflinePage />);
    expect(screen.getByRole("heading", { name: /sem conexão/i })).toBeInTheDocument();
    expect(screen.getByText(/offline/i)).toBeInTheDocument();
  });
});
