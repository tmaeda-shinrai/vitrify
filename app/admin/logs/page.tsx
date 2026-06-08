import { listAuditLogs } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

function fmt(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(
    new Date(value),
  );
}

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: { actor?: string; action?: string; from?: string; to?: string };
}) {
  const logs = await listAuditLogs({
    actorId: searchParams.actor?.trim() || undefined,
    action: searchParams.action?.trim() || undefined,
    from: searchParams.from || undefined,
    to: searchParams.to || undefined,
  });

  return (
    <div className="space-y-4">
      <form className="flex flex-wrap gap-2 text-sm">
        <input
          name="action"
          defaultValue={searchParams.action ?? ""}
          placeholder="ação (ex.: product.)"
          aria-label="Filtrar por ação"
          className="rounded-md border border-input bg-background px-3 py-2"
        />
        <input
          name="actor"
          defaultValue={searchParams.actor ?? ""}
          placeholder="actor id"
          aria-label="Filtrar por ator"
          className="rounded-md border border-input bg-background px-3 py-2"
        />
        <input
          type="date"
          name="from"
          defaultValue={searchParams.from ?? ""}
          aria-label="De"
          className="rounded-md border border-input bg-background px-3 py-2"
        />
        <input
          type="date"
          name="to"
          defaultValue={searchParams.to ?? ""}
          aria-label="Até"
          className="rounded-md border border-input bg-background px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
        >
          Filtrar
        </button>
      </form>

      <p className="text-xs text-muted-foreground">{logs.length} evento(s)</p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Quando</th>
              <th className="px-3 py-2 font-medium">Ação</th>
              <th className="px-3 py-2 font-medium">Entidade</th>
              <th className="px-3 py-2 font-medium">Ator</th>
              <th className="px-3 py-2 font-medium">IP (hash)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-muted/30">
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                  {fmt(l.createdAt)}
                </td>
                <td className="px-3 py-2 font-medium">{l.action}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {l.entityType ?? "—"}
                  {l.entityId ? ` · ${l.entityId.slice(0, 8)}` : ""}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {l.actorId ? l.actorId.slice(0, 8) : "—"}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {l.ipHash ? l.ipHash.slice(0, 10) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
