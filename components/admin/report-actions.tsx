"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { blockVitrineAction, setReportStatusAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

/**
 * Ações de uma denúncia no admin (#0023): mudar status e ocultar a vitrine
 * (reusa o bloqueio do PR2). SLA 48h é sinalizado na página pela idade do caso.
 */
export function ReportActions({
  reportId,
  vitrineId,
  slug,
  resolved,
}: {
  reportId: string;
  vitrineId: string;
  slug: string | null;
  resolved: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, okMsg = "Feito.") {
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        toast.error(result.error ?? "Falhou.");
        return;
      }
      toast.success(okMsg);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={() =>
          run(
            () => blockVitrineAction(vitrineId, `denúncia ${reportId.slice(0, 8)}`),
            "Vitrine ocultada.",
          )
        }
      >
        Ocultar vitrine{slug ? ` @${slug}` : ""}
      </Button>
      {!resolved && (
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => run(() => setReportStatusAction(reportId, "resolved"), "Resolvida.")}
          >
            Resolver
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => run(() => setReportStatusAction(reportId, "dismissed"), "Descartada.")}
          >
            Descartar
          </Button>
        </>
      )}
    </div>
  );
}
