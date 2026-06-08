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

const img = (url: string, alt = "") => ({ url, alt });
const images = [
  img("https://x.test/a.webp"),
  img("https://x.test/b.webp"),
  img("https://x.test/c.webp"),
];

describe("ProductImagesManager", () => {
  it("remove a foto pelo índice", () => {
    const onChange = vi.fn();
    render(<ProductImagesManager value={images} onChange={onChange} />);
    fireEvent.click(screen.getAllByLabelText("removePhoto")[0]!);
    expect(onChange).toHaveBeenCalledWith([images[1], images[2]]);
  });

  it("move a foto escolhida para a capa (índice 0)", () => {
    const onChange = vi.fn();
    render(<ProductImagesManager value={images} onChange={onChange} />);
    fireEvent.click(screen.getAllByLabelText("makeCover")[2]!);
    expect(onChange).toHaveBeenCalledWith([images[2], images[0], images[1]]);
  });

  it("adiciona a foto enviada ao fim da lista (alt vazio)", () => {
    const onChange = vi.fn();
    render(<ProductImagesManager value={images} onChange={onChange} />);
    fireEvent.click(screen.getByText("mock-add"));
    expect(onChange).toHaveBeenCalledWith([...images, img("https://x.test/new.webp")]);
  });

  it("edita o texto alternativo da foto", () => {
    const onChange = vi.fn();
    render(<ProductImagesManager value={images} onChange={onChange} />);
    fireEvent.change(screen.getAllByLabelText("altLabel")[0]!, {
      target: { value: "Batom azul" },
    });
    expect(onChange).toHaveBeenCalledWith([
      img("https://x.test/a.webp", "Batom azul"),
      images[1],
      images[2],
    ]);
  });

  it("esconde o controle de adicionar ao atingir o máximo", () => {
    const five = Array.from({ length: 5 }, (_, i) => img(`https://x.test/${i}.webp`));
    render(<ProductImagesManager value={five} onChange={vi.fn()} />);
    expect(screen.queryByText("mock-add")).not.toBeInTheDocument();
  });
});
