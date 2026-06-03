"use client";

import { useEffect, useMemo, useState } from "react";
import { Package, PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VitrineGrid } from "@/components/vitrine/vitrine-grid";
import type { ProductListItem } from "@/lib/products";
import { brandOptions, categoryOptions, filterProducts, type FilterOption } from "@/lib/search";
import { cn } from "@/lib/utils";

interface Props {
  products: ProductListItem[];
  whatsapp: string | null;
  ownerName: string | null;
  vitrineUrl: string;
  slug: string;
}

/**
 * Busca + filtros (categoria/marca) da vitrine pública (#0014), client-side sobre
 * os produtos já renderizados (preserva o ISR). O estado inicial vem da URL após
 * hidratar e é sincronizado de volta via history.replaceState (link compartilhável).
 */
export function VitrineExplorer({ products, whatsapp, ownerName, vitrineUrl, slug }: Props) {
  const t = useTranslations("vitrine");
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);

  const categories = useMemo(() => categoryOptions(products), [products]);
  const brands = useMemo(() => brandOptions(products), [products]);

  // Lê os filtros da URL só após hidratar (a grid completa fica no HTML estático).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") ?? "");
    setCategoryId(params.get("categoria"));
    setBrandId(params.get("marca"));
  }, []);

  // Reflete o estado na URL sem navegar (compartilhável, sem refetch / sem quebrar ISR).
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (categoryId) params.set("categoria", categoryId);
    if (brandId) params.set("marca", brandId);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [query, categoryId, brandId]);

  const filtered = useMemo(
    () => filterProducts(products, { query, categoryId, brandId }),
    [products, query, categoryId, brandId],
  );

  if (products.length === 0) {
    return (
      <EmptyState icon={Package} title={t("emptyTitle")} description={t("emptyDescription")} />
    );
  }

  function clearFilters() {
    setQuery("");
    setCategoryId(null);
    setBrandId(null);
  }

  return (
    <div className="space-y-4">
      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchPlaceholder")}
      />

      {categories.length > 1 ? (
        <Chips
          options={categories}
          selected={categoryId}
          onSelect={setCategoryId}
          allLabel={t("allCategories")}
        />
      ) : null}

      {brands.length > 1 ? (
        <Chips
          options={brands}
          selected={brandId}
          onSelect={setBrandId}
          allLabel={t("allBrands")}
        />
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={t("noResultsTitle")}
          description={t("noResultsDescription")}
          action={
            <Button variant="outline" onClick={clearFilters}>
              {t("clearFilters")}
            </Button>
          }
        />
      ) : (
        <VitrineGrid
          products={filtered}
          whatsapp={whatsapp}
          ownerName={ownerName}
          vitrineUrl={vitrineUrl}
          slug={slug}
        />
      )}
    </div>
  );
}

function Chips({
  options,
  selected,
  onSelect,
  allLabel,
}: {
  options: FilterOption[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  allLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip active={selected === null} onClick={() => onSelect(null)}>
        {allLabel}
      </Chip>
      {options.map((option) => (
        <Chip key={option.id} active={selected === option.id} onClick={() => onSelect(option.id)}>
          {option.name}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
