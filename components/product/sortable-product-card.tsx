"use client";

import { GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { ProductCard } from "@/components/product/product-card";
import type { ProductListItem } from "@/lib/products";
import { cn } from "@/lib/utils";

interface Props {
  product: ProductListItem;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function SortableProductCard({ product, onEdit, onDuplicate, onDelete }: Props) {
  const t = useTranslations("produtos");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const handle = (
    <button
      type="button"
      className="flex size-8 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-accent active:cursor-grabbing"
      aria-label={t("dragHandle")}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-4" />
    </button>
  );

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "z-10 opacity-70")}>
      <ProductCard
        product={product}
        dragHandle={handle}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    </div>
  );
}
