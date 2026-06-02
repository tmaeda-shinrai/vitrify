import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StepSlug } from "@/components/onboarding/steps/step-slug";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/app/onboarding/actions", () => ({
  saveSlugAction: vi.fn(),
}));

const rpc = vi.fn();
vi.mock("@/lib/supabase/browser", () => ({
  createClient: () => ({ rpc }),
}));

describe("StepSlug", () => {
  it("bloqueia slug reservado em tempo real (sem chamar o rpc)", () => {
    render(<StepSlug name="Maria Silva" onDone={() => {}} />);
    const input = screen.getByLabelText("slugLabel");
    fireEvent.change(input, { target: { value: "admin" } });

    expect(screen.getByText("slugReserved")).toBeInTheDocument();
    expect(rpc).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "continue" })).toBeDisabled();
  });

  it("marca formato inválido", () => {
    render(<StepSlug name="Maria Silva" onDone={() => {}} />);
    const input = screen.getByLabelText("slugLabel");
    fireEvent.change(input, { target: { value: "ab" } });
    expect(screen.getByText("slugInvalid")).toBeInTheDocument();
  });

  it("oferece sugestões a partir do nome", () => {
    render(<StepSlug name="Maria Silva" onDone={() => {}} />);
    expect(screen.getByText("maria-silva")).toBeInTheDocument();
  });
});
