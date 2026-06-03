import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { VitrineViewTracker } from "@/components/vitrine/vitrine-view-tracker";
import { recordVitrineView } from "@/lib/view";

vi.mock("@/lib/view", () => ({ recordVitrineView: vi.fn() }));

describe("VitrineViewTracker", () => {
  it("registra a view no mount", () => {
    render(<VitrineViewTracker slug="maria" />);
    expect(recordVitrineView).toHaveBeenCalledWith("maria");
  });
});
