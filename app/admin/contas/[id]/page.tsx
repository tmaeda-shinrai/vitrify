import Link from "next/link";
import { notFound } from "next/navigation";

import { getAccount } from "@/lib/admin/accounts";

export const dynamic = "force-dynamic";

function fmt(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(value),
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

export default async function AdminAccountDetailPage({ params }: { params: { id: string } }) {
  const account = await getAccount(params.id);
  if (!account) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/admin" className="text-sm text-primary hover:underline">
        ← Voltar para contas
      </Link>

      <div>
        <h2 className="font-display text-2xl font-bold">{account.fullName}</h2>
        <p className="text-sm text-muted-foreground">{account.email ?? "—"}</p>
      </div>

      <section className="rounded-lg border border-border p-4">
        <Row label="Plano" value={`${account.plan ?? "—"} (${account.status ?? "—"})`} />
        <Row
          label="Vitrine"
          value={
            account.slug ? (
              <a
                href={`/${account.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                @{account.slug} {account.vitrineActive ? "(ativa)" : "(inativa)"}
              </a>
            ) : (
              "—"
            )
          }
        />
        <Row label="WhatsApp" value={account.whatsapp ?? "—"} />
        <Row label="Cadastro" value={fmt(account.createdAt)} />
        <Row label="Onboarding" value={fmt(account.onboardingCompletedAt)} />
        <Row
          label="Exclusão pedida"
          value={account.deletionRequestedAt ? fmt(account.deletionRequestedAt) : "—"}
        />
      </section>

      <p className="text-xs text-muted-foreground">
        Ações de bloqueio/reativação chegam no próximo PR.
      </p>
    </div>
  );
}
