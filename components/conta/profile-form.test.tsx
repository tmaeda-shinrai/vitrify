import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProfileForm } from "@/components/conta/profile-form";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));

const updateProfileAction = vi.fn();
vi.mock("@/app/(dashboard)/conta/actions", () => ({
  updateProfileAction: (...args: unknown[]) => updateProfileAction(...args),
  createAvatarUploadUrl: vi.fn(),
}));

vi.mock("@/components/shared/image-uploader", () => ({
  ImageUploader: () => <div data-testid="image-uploader" />,
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

const initial = {
  fullName: "Maria Silva",
  bio: "a".repeat(161),
  whatsapp: "5567999999999",
  avatarUrl: null,
};

describe("ProfileForm", () => {
  it("mostra o contador de bio", () => {
    render(<ProfileForm initial={initial} />);
    expect(screen.getByText(`161/160`)).toBeInTheDocument();
  });

  it("bloqueia bio acima de 160 e não chama a action", async () => {
    render(<ProfileForm initial={initial} />);
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    expect(await screen.findByText(/160 caracteres/)).toBeInTheDocument();
    await waitFor(() => expect(updateProfileAction).not.toHaveBeenCalled());
  });
});
