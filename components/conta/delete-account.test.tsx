import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DeleteAccount } from "@/components/conta/delete-account";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));

vi.mock("@/app/(dashboard)/conta/actions", () => ({
  requestAccountDeletionAction: vi.fn(),
}));

describe("DeleteAccount", () => {
  it("abre o diálogo de confirmação ao clicar em excluir", () => {
    render(<DeleteAccount />);
    expect(screen.queryByText("deleteConfirmTitle")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "deleteAccount" }));

    expect(screen.getByText("deleteConfirmTitle")).toBeInTheDocument();
    expect(screen.getByText("deleteConfirmDescription")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "deleteConfirm" })).toBeInTheDocument();
  });
});
