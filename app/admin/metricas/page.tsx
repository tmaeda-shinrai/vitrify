import { Activity, CalendarDays, Users } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { funnelSteps, getAdminMetrics } from "@/lib/admin/metrics";

export const dynamic = "force-dynamic";

export default async function AdminMetricasPage() {
  const metrics = await getAdminMetrics();
  const steps = funnelSteps(metrics);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="DAU (24h)" value={metrics.dau} icon={Activity} hint="ativas hoje" />
        <StatCard label="MAU (30d)" value={metrics.mau} icon={Users} hint="ativas no mês" />
        <StatCard label="Cadastros" value={metrics.signups} icon={CalendarDays} />
      </div>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold">Funil</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {steps.map((step) => (
                <tr key={step.key}>
                  <td className="px-3 py-2">{step.label}</td>
                  <td className="px-3 py-2 text-right font-medium">{step.count}</td>
                  <td className="w-16 px-3 py-2 text-right text-muted-foreground">
                    {step.pctOfSignups}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          DAU/MAU = usuárias distintas com atividade auditada na janela; % do funil sobre o total de
          cadastros.
        </p>
      </section>
    </div>
  );
}
