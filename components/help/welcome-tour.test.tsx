import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import messages from "@/messages/pt-BR.json";

let mockParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockParams,
}));

import { WelcomeTour } from "@/components/help/welcome-tour";

const FLAG_KEY = "vitrinio:welcome-tour:v1";

function renderTour() {
  return render(
    <NextIntlClientProvider locale="pt-BR" messages={messages}>
      <WelcomeTour />
    </NextIntlClientProvider>,
  );
}

describe("WelcomeTour", () => {
  beforeEach(() => {
    localStorage.clear();
    mockParams = new URLSearchParams();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it("mostra o card quando bemvinda=1 e ainda não foi visto, e grava a flag", () => {
    mockParams = new URLSearchParams("bemvinda=1");
    renderTour();
    expect(screen.getByText(/Bem-vinda ao Vitrinio/i)).toBeInTheDocument();
    expect(localStorage.getItem(FLAG_KEY)).toBe("1");
  });

  it("não mostra quando a flag já está setada", () => {
    localStorage.setItem(FLAG_KEY, "1");
    mockParams = new URLSearchParams("bemvinda=1");
    renderTour();
    expect(screen.queryByText(/Bem-vinda ao Vitrinio/i)).not.toBeInTheDocument();
  });

  it("não mostra sem o param bemvinda", () => {
    renderTour();
    expect(screen.queryByText(/Bem-vinda ao Vitrinio/i)).not.toBeInTheDocument();
  });
});
