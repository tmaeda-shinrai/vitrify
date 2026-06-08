"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REPORT_REASONS, REPORT_REASON_LABELS, type ReportReason } from "@/lib/validators/report";

/**
 * Formulário de denúncia de vitrine (#0023). Posta em `POST /api/report` (anon,
 * rate-limited). Resposta sempre neutra; ao enviar, mostra confirmação.
 */
export function ReportForm({ slug }: { slug: string }) {
  const t = useTranslations("report");
  const [reason, setReason] = useState<ReportReason>("copyright");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, reason, description, reporterEmail: email }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError(t("error"));
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-5 text-sm">
        <p className="font-medium">{t("sentTitle")}</p>
        <p className="mt-1 text-muted-foreground">{t("sentText")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="reason">{t("reasonLabel")}</Label>
        <select
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value as ReportReason)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {REPORT_REASONS.map((r) => (
            <option key={r} value={r}>
              {REPORT_REASON_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">{t("descriptionLabel")}</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder={t("descriptionPlaceholder")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">{t("emailLabel")}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
