import Link from "next/link";

import { ReportActions } from "@/components/admin/report-actions";
import { listReports } from "@/lib/admin/reports";
import { REPORT_REASON_LABELS, type ReportReason } from "@/lib/validators/report";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = ["open", "investigating", "resolved", "dismissed"] as const;
const DAY_MS = 86_400_000;

function ageHours(createdAt: string | null): number {
  if (!createdAt) return 0;
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / (DAY_MS / 24));
}

export default async function AdminDenunciasPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status?.trim() || undefined;
  const reports = await listReports(status);

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/denuncias"
          className={
            !status ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
          }
        >
          Todas
        </Link>
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={`/admin/denuncias?status=${s}`}
            className={
              status === s
                ? "font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }
          >
            {s}
          </Link>
        ))}
      </nav>

      <p className="text-xs text-muted-foreground">{reports.length} denúncia(s)</p>

      <ul className="space-y-3">
        {reports.map((r) => {
          const overdue = r.status === "open" && ageHours(r.createdAt) >= 48;
          return (
            <li key={r.id} className="space-y-2 rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">
                    {REPORT_REASON_LABELS[r.reason as ReportReason] ?? r.reason}
                    {r.slug ? (
                      <>
                        {" · "}
                        <a
                          href={`/${r.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          @{r.slug}
                        </a>
                      </>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.status} · há {ageHours(r.createdAt)}h
                    {overdue ? (
                      <span className="ml-2 font-medium text-destructive">SLA 48h vencido</span>
                    ) : null}
                  </p>
                </div>
              </div>
              {r.description ? (
                <p className="text-sm text-muted-foreground">{r.description}</p>
              ) : null}
              {r.reporterEmail ? (
                <p className="text-xs text-muted-foreground">Denunciante: {r.reporterEmail}</p>
              ) : null}
              <ReportActions
                reportId={r.id}
                vitrineId={r.vitrineId}
                slug={r.slug}
                resolved={r.status === "resolved" || r.status === "dismissed"}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
