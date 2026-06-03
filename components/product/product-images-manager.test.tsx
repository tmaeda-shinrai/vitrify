import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductImagesManager } from "@/components/product/product-images-manager";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));
vi.mock("@/app/(dashboard)/produtos/actions", () => ({ createProductImageUploadUrl: vi.fn() }));
vi.mock("@/components/shared/image-uploader", () => ({
  ImageUploader: ({ onUploaded }: { onUploaded: (url: string) => void }) => (
    <button type="button" onClick={() => onUploaded("https://x.test/new.webp")}>
      mock-add
    </button>
  ),
}));

const urls = ["https://x.test/a.webp", "https://x.test/b.webp", "https://x.test/c.webp"];

describe("ProductImagesManager", () => {
  it("remove a foto pelo índice", () => {
    const onChange = vi.fn();
    render(<ProductImagesManager value={urls} onChange={onChange} />);
    fireEvent.click(screen.getAllByLabelText("removePhoto")[0]!);
    expect(onChange).toHaveBeenCalledWith([urls[1], urls[2]]);
  });

  it("move a foto escolhida para a capa (índice 0)", () => {
    const onChange = vi.fn();
    render(<ProductImagesManager value={urls} onChange={onChange} />);
    fireEvent.click(screen.getAllByLabelText("makeCover")[2]!);
    expect(onChange).toHaveBeenCalledWith([urls[2], urls[0], urls[1]]);
  });

  it("adiciona a foto enviada ao fim da lista", () => {
    const onChange = vi.fn();
    render(<ProductImagesManager value={urls} onChange={onChange} />);
    fireEvent.click(screen.getByText("mock-add"));
    expect(onChange).toHaveBeenCalledWith([...urls, "https://x.test/new.webp"]);
  });

  it("esconde o controle de adicionar ao atingir o máximo", () => {
    const five = Array.from({ length: 5 }, (_, i) => `https://x.test/${i}.webp`);
    render(<ProductImagesManager value={five} onChange={vi.fn()} />);
    expect(screen.queryByText("mock-add")).not.toBeInTheDocument();
  });
});
