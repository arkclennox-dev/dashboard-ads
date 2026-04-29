"use client";

import { IconChevronDown } from "./icons";
import { BarChart, LineChart } from "./charts";

interface DashboardChartsProps {
  komisi: number[];
  spend: number[];
  clicks: number[];
  labels: string[];
}

const fmtRp = (n: number) => `Rp ${Math.round(n / 1000)}k`;
const fmtNum = (n: number) => `${Math.round(n)}`;

export function DashboardCharts({ komisi, spend, clicks, labels }: DashboardChartsProps) {
  const netProfit = komisi.map((k, i) => k - (spend[i] ?? 0));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-xl2 border border-border bg-surface-2 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Komisi</h3>
          <button className="flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink-2">
            Daily <IconChevronDown width={14} height={14} />
          </button>
        </div>
        <LineChart values={komisi} labels={labels} color="#22c55e" formatY={fmtRp} />
      </div>

      <div className="rounded-xl2 border border-border bg-surface-2 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Spend by Date</h3>
          <button className="flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink-2">
            Daily <IconChevronDown width={14} height={14} />
          </button>
        </div>
        <BarChart values={spend} labels={labels} color="#3b82f6" formatY={fmtRp} />
      </div>

      <div className="rounded-xl2 border border-border bg-surface-2 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Clicks Over Time</h3>
          <button className="flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink-2">
            Daily <IconChevronDown width={14} height={14} />
          </button>
        </div>
        <LineChart values={clicks} labels={labels} color="#f59e0b" formatY={fmtNum} />
      </div>

      <div className="rounded-xl2 border border-border bg-surface-2 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Net Profit</h3>
            <p className="text-[11px] text-muted">Komisi − Spend per hari</p>
          </div>
          <button className="flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink-2">
            Daily <IconChevronDown width={14} height={14} />
          </button>
        </div>
        <LineChart values={netProfit} labels={labels} color="#a855f7" formatY={fmtRp} />
      </div>
    </div>
  );
}
