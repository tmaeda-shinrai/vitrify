"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  createCategoryAction,
  deleteCategoryAction,
  renameCategoryAction,
  reorderCategoriesAction,
} from "@/app/(dashboard)/produtos/category-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CATEGORIES_QUERY_KEY } from "@/hooks/use-categories";
import { PRODUCTS_QUERY_KEY } from "@/hooks/use-products";
import { CATEGORY_NAME_MAX } from "@/lib/validators/product";
import type { CategoryItem } from "@/lib/products";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryItem[];
}

export function CategoriesSheet({ open, onOpenChange, categories }: Props) {
  const t = useTranslations("produtos");
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
  }

  async function handleAdd() {
    const name = newName.trim();
    if (!name || busy) return;
    setBusy(true);
    const result = await createCategoryAction(name);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setNewName("");
    refresh();
  }

  async function handleRename(id: string, name: string) {
    const result = await renameCategoryAction(id, name);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    refresh();
  }

  async function handleDelete(id: string) {
    const result = await deleteCategoryAction(id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    refresh();
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const ids = categories.map((c) => c.id);
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    const result = await reorderCategoriesAction(ids);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    refresh();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("categoriesTitle")}</SheetTitle>
          <SheetDescription>{t("categoriesDescription")}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleAdd();
                }
              }}
              placeholder={t("newCategoryPlaceholder")}
              maxLength={CATEGORY_NAME_MAX}
            />
            <Button
              type="button"
              onClick={handleAdd}
              disabled={busy || newName.trim() === ""}
              aria-label={t("addCategory")}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            </Button>
          </div>

          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("categoriesEmpty")}</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((category, index) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  isFirst={index === 0}
                  isLast={index === categories.length - 1}
                  onRename={(name) => handleRename(category.id, name)}
                  onDelete={() => handleDelete(category.id)}
                  onMoveUp={() => handleMove(index, -1)}
                  onMoveDown={() => handleMove(index, 1)}
                />
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface CategoryRowProps {
  category: CategoryItem;
  isFirst: boolean;
  isLast: boolean;
  onRename: (name: string) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function CategoryRow({
  category,
  isFirst,
  isLast,
  onRename,
  onDelete,
  onMoveUp,
  onMoveDown,
}: CategoryRowProps) {
  const t = useTranslations("produtos");
  const [value, setValue] = useState(category.name);

  function commit() {
    const name = value.trim();
    if (name === "" || name === category.name) {
      setValue(category.name);
      return;
    }
    onRename(name);
  }

  return (
    <li className="flex items-center gap-1">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        maxLength={CATEGORY_NAME_MAX}
        aria-label={t("renameCategory")}
        className="h-9"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 shrink-0"
        disabled={isFirst}
        aria-label={t("moveUp")}
        onClick={onMoveUp}
      >
        <ChevronUp className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 shrink-0"
        disabled={isLast}
        aria-label={t("moveDown")}
        onClick={onMoveDown}
      >
        <ChevronDown className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 shrink-0 text-destructive hover:text-destructive"
        aria-label={t("deleteCategory")}
        onClick={onDelete}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}
