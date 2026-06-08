"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  blockAccountAction,
  blockVitrineAction,
  unblockAccountAction,
  unblockVitrineAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

/**
 * Controles de moderação no detalhe da conta (#0023): bloquear/reativar a vitrine
 * e a conta. O bloqueio pede um motivo; tudo via Server Action (service role).
 */
export function BlockControls({
  userId,
  vitrineId,
  accountBlocked,
  vitrineBlocked,
}: {
  userId: string;
  vitrineId: string | null;
  accountBlocked: boolean;
  vitrineBlocked: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        toast.error(result.error ?? "Falhou.");
        return;
      }
      toast.success("Feito.");
      router.refresh();
    });
  }

  function withReason(action: (reason: string) => Promise<{ ok: boolean; error?: string }>) {
    const reason = window.prompt("Motivo do bloqueio (registrado na auditoria):") ?? "";
    if (reason === null) return;
    run(() => action(reason));
  }

  return (
    <section className="space-y-3 rounded-lg border border-destructive/30 p-4">
      <h3 className="font-medium text-destructive">Moderação</h3>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Vitrine:</span>
        {vitrineBlocked ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending || !vitrineId}
            onClick={() => vitrineId && run(() => unblockVitrineAction(vitrineId))}
          >
            Reativar vitrine
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={pending || !vitrineId}
            onClick={() => vitrineId && withReason((r) => blockVitrineAction(vitrineId, r))}
          >
            Bloquear vitrine
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Conta:</span>
        {accountBlocked ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => run(() => unblockAccountAction(userId))}
          >
            Reativar conta
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={pending}
            onClick={() => withReason((r) => blockAccountAction(userId, r))}
          >
            Suspender conta
          </Button>
        )}
      </div>
    </section>
  );
}
