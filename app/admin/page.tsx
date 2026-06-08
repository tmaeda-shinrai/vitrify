import Link from "next/link";

import { listAccounts } from "@/lib/admin/accounts";

export const dynamic = "force-dynamic";

function fmtDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value));
}

export default async function AdminAccountsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const accounts = await listAccounts(q || undefined);

  return (
    <div className="space-y-4">
      <form className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por e-mail, nome ou @"
          aria-label="Buscar contas"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Buscar
        </button>
      </form>

      <p className="text-xs text-muted-foreground">{accounts.length} conta(s)</p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Nome</th>
              <th className="px-3 py-2 font-medium">E-mail</th>
              <th className="px-3 py-2 font-medium">Plano</th>
              <th className="px-3 py-2 font-medium">@</th>
              <th className="px-3 py-2 font-medium">Vitrine</th>
              <th className="px-3 py-2 font-medium">Cadastro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {accounts.map((a) => (
              <tr key={a.id} className="hover:bg-muted/30">
                <td className="px-3 py-2">
                  <Link href={`/admin/contas/${a.id}`} className="text-primary underline">
                    {a.fullName}
                  </Link>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{a.email ?? "—"}</td>
                <td className="px-3 py-2">{a.plan ?? "—"}</td>
                <td className="px-3 py-2 text-muted-foreground">{a.slug ?? "—"}</td>
                <td className="px-3 py-2">{a.vitrineActive ? "ativa" : "inativa"}</td>
                <td className="px-3 py-2 text-muted-foreground">{fmtDate(a.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
