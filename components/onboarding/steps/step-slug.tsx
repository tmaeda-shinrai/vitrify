"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { saveSlugAction } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isReservedSlug, SLUG_REGEX, suggestSlugs } from "@/lib/slug";
import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type Status = "idle" | "invalid" | "reserved" | "checking" | "available" | "taken" | "error";

export function StepSlug({ name, onDone }: { name: string; onDone: () => void }) {
  const t = useTranslations("onboarding");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [submitting, setSubmitting] = useState(false);
  const reqId = useRef(0);

  const suggestions = useMemo(() => suggestSlugs(name), [name]);

  useEffect(() => {
    if (!value) return setStatus("idle");
    if (!SLUG_REGEX.test(value)) return setStatus("invalid");
    if (isReservedSlug(value)) return setStatus("reserved");

    setStatus("checking");
    const current = ++reqId.current;
    const timer = setTimeout(async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc("is_slug_available", { p_slug: value });
        if (current !== reqId.current) return; // resposta obsoleta
        if (error) return setStatus("error");
        setStatus(data ? "available" : "taken");
      } catch {
        if (current === reqId.current) setStatus("error");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value]);

  async function handleSubmit() {
    if (status !== "available") return;
    setSubmitting(true);
    const result = await saveSlugAction({ slug: value });
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error);
      setStatus("taken");
      return;
    }
    onDone();
  }

  const message: Record<Status, string> = {
    idle: "",
    invalid: t("slugInvalid"),
    reserved: t("slugReserved"),
    checking: t("slugChecking"),
    available: t("slugAvailable"),
    taken: t("slugTaken"),
    error: t("slugError"),
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="slug">{t("slugLabel")}</Label>
        <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <span className="pl-3 text-sm text-muted-foreground">vitrinio.com.br/</span>
          <Input
            id="slug"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value.toLowerCase().trim())}
            className="border-0 pl-1 focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-invalid={["invalid", "reserved", "taken"].includes(status)}
          />
          <StatusIcon status={status} />
        </div>
        {message[status] ? (
          <p
            className={cn(
              "mt-1.5 text-sm",
              status === "available" ? "text-emerald-600" : "text-muted-foreground",
              ["invalid", "reserved", "taken", "error"].includes(status) && "text-destructive",
            )}
          >
            {message[status]}
          </p>
        ) : null}
      </div>

      {suggestions.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">{t("slugSuggestions")}</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setValue(s)}
                className="rounded-full border border-input px-3 py-1 text-sm hover:bg-accent"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <Button
        type="button"
        className="w-full"
        onClick={handleSubmit}
        disabled={status !== "available" || submitting}
      >
        {t("continue")}
      </Button>
    </div>
  );
}

function StatusIcon({ status }: { status: Status }) {
  if (status === "checking") {
    return <Loader2 className="mr-3 size-4 animate-spin text-muted-foreground" />;
  }
  if (status === "available") return <Check className="mr-3 size-4 text-emerald-600" />;
  if (["invalid", "reserved", "taken", "error"].includes(status)) {
    return <X className="mr-3 size-4 text-destructive" />;
  }
  return null;
}
