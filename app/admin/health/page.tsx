import { checkHealth, type HealthStatus } from "@/lib/admin/health";

export const dynamic = "force-dynamic";

const DOT: Record<HealthStatus, string> = {
  ok: "bg-green-500",
  down: "bg-red-500",
  unconfigured: "bg-amber-500",
};

const LABEL: Record<HealthStatus, string> = {
  ok: "OK",
  down: "Fora do ar",
  unconfigured: "Não configurado",
};

export default async function AdminHealthPage() {
  const services = await checkHealth();

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {services.map((s) => (
        <li key={s.name} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${DOT[s.status]}`} aria-hidden />
            <span className="text-sm font-medium">{s.name}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {LABEL[s.status]} · {s.detail}
          </span>
        </li>
      ))}
    </ul>
  );
}
