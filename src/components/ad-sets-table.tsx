import type { AdSetRow } from "@/lib/reports";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import {
  IconArrowDown,
  IconChevronLeft,
  IconChevronRight,
  IconEdit,
  IconMore,
  IconTrend,
} from "./icons";

interface AdSetsTableProps {
  rows: AdSetRow[];
  total: number;
}

const statusStyles: Record<AdSetRow["status"], string> = {
  Active: "bg-success/10 text-success",
  Paused: "bg-warn/15 text-warn",
  Inactive: "bg-muted-2/15 text-muted",
};

export function AdSetsTable({ rows, total }: AdSetsTableProps) {
  const visible = rows.slice(0, 8);
  return (
    <div className="rounded-xl2 border border-border bg-surface-2">
      <div className="flex items-center gap-3 px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Ad Sets Performance</h2>
        <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-ink-2">
          {total} Ad Sets
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-muted">
            <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:font-medium border-y border-border">
              <th>
                <input type="checkbox" className="accent-brand" aria-label="Select all" />
              </th>
              <th>Ad Set Name</th>
              <th>Status</th>
              <th>
                <span className="inline-flex items-center gap-1">
                  Spend <IconArrowDown width={12} height={12} />
                </span>
              </th>
              <th>Impressions</th>
              <th>Clicks</th>
              <th>CPC</th>
              <th>CTR</th>
              <th>Conversion Rate</th>
              <th>ROAS</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={row.id}
                className="row-hover border-b border-border last:border-0 [&>td]:px-3 [&>td]:py-3"
              >
                <td>
                  <input
                    type="checkbox"
                    className="accent-brand"
                    aria-label={`Select ${row.ad_set_name}`}
                  />
                </td>
                <td className="font-medium text-ink">{row.ad_set_name}</td>
                <td>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyles[row.status]}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="text-ink-2">{formatCurrency(row.spend)}</td>
                <td className="text-ink-2">{formatNumber(row.impressions)}</td>
                <td className="text-ink-2">{formatNumber(row.clicks)}</td>
                <td className="text-ink-2">{formatCurrency(row.cpc)}</td>
                <td className="text-ink-2">{formatPercent(row.ctr)}</td>
                <td className="text-ink-2">{formatPercent(row.conversion_rate)}</td>
                <td className="text-ink-2">{row.roas.toFixed(2)}</td>
                <td>
                  <div className="flex items-center justify-end gap-1 text-muted">
                    <button
                      className="rounded p-1 hover:bg-surface-3 hover:text-ink"
                      aria-label="View metrics"
                    >
                      <IconTrend />
                    </button>
                    <button
                      className="rounded p-1 hover:bg-surface-3 hover:text-ink"
                      aria-label="Edit"
                    >
                      <IconEdit />
                    </button>
                    <button
                      className="rounded p-1 hover:bg-surface-3 hover:text-ink"
                      aria-label="More"
                    >
                      <IconMore />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-xs text-muted">
        <span>
          Showing 1 to {Math.min(visible.length, total)} of {total} results
        </span>
        <div className="flex items-center gap-1">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface text-muted hover:text-ink"
            aria-label="Previous page"
          >
            <IconChevronLeft />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-white">
            1
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface text-ink-2 hover:text-ink">
            2
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface text-muted hover:text-ink"
            aria-label="Next page"
          >
            <IconChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
