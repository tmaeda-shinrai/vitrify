"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { setAmbassadorAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

/**
 * Programa de embaixadoras no detalhe da conta (#0025, `docs/GTM.md` §2.1): conceder
 * Plus vitalício + selo "Embaixadora Pioneira" ou encerrar a parceria. Via Server Action
 * (service role), à prova da dona (trigger `protect_profile_ambassador`).
 */
export function AmbassadorControls({
  userId,
  isAmbassador,
}: {
  userId: string;
  isAmbassador: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(makeAmbassador: boolean) {
    if (!makeAmbassador && !window.confirm("Encerrar a parceria e voltar a conta para Free?")) {
      return;
    }
    startTransition(async () => {
      const result = await setAmbassadorAction(userId, makeAmbassador);
      if (!result.ok) {
        toast.error(result.error ?? "Falhou.");
        return;
      }
      toast.success("Feito.");
      router.refresh();
    });
  }

  return (
    <section className="space-y-3 rounded-lg border border-border p-4">
      <h3 className="font-medium">Embaixadora Pioneira</h3>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {isAmbassador ? "Ativa (Plus vitalício)" : "Não é embaixadora"}
        </span>
        {isAmbassador ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => run(false)}
          >
            Encerrar parceria
          </Button>
        ) : (
          <Button type="button" size="sm" disabled={pending} onClick={() => run(true)}>
            Conceder Plus vitalício
          </Button>
        )}
      </div>
    </section>
  );
}
