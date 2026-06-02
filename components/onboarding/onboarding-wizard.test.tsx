import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Isola o wizard dos passos reais (que importam actions/browser client).
vi.mock("@/components/onboarding/steps/step-name", () => ({
  StepName: () => <div data-testid="step-name" />,
}));
vi.mock("@/components/onboarding/steps/step-slug", () => ({
  StepSlug: () => <div data-testid="step-slug" />,
}));
vi.mock("@/components/onboarding/steps/step-whatsapp", () => ({
  StepWhatsapp: () => <div data-testid="step-whatsapp" />,
}));
vi.mock("@/components/onboarding/steps/step-photo", () => ({
  StepPhoto: () => <div data-testid="step-photo" />,
}));

const data = { fullName: "Maria", whatsapp: "", googleAvatarUrl: null };

describe("OnboardingWizard", () => {
  it("começa no passo inicial informado", () => {
    render(<OnboardingWizard data={data} initialStep={1} />);
    expect(screen.getByTestId("step-name")).toBeInTheDocument();
    expect(screen.getByText("nameTitle")).toBeInTheDocument();
  });

  it("retoma direto no passo de WhatsApp quando indicado", () => {
    render(<OnboardingWizard data={data} initialStep={3} />);
    expect(screen.getByTestId("step-whatsapp")).toBeInTheDocument();
    expect(screen.queryByTestId("step-name")).not.toBeInTheDocument();
  });

  it("clampa passos fora do intervalo", () => {
    render(<OnboardingWizard data={data} initialStep={99} />);
    expect(screen.getByTestId("step-photo")).toBeInTheDocument();
  });
});
