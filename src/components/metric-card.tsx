import { IconArrowDown, IconArrowUp, IconInfo } from "./icons";
import { Sparkline } from "./charts";

interface MetricCardProps {
  label: string;
  value: string;
  delta: number;
  values: number[];
  hint?: string;
  comparison?: string;
}

export function MetricCard({
  label,
  value,
  delta,
  values,
  hint,
  comparison,
}: MetricCardProps) {
  const isPositive = delta >= 0;
  return (
    <div className="rounded-xl2 border border-border bg-surface-2 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-ink-2">
          <span>{label}</span>
          {hint && (
            <span title={hint} className="text-muted-2">
              <IconInfo width={13} height={13} />
            </span>
          )}
        </div>
      </div>
      <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="whitespace-nowrap text-2xl font-semibold tracking-tight">{value}</span>
        <span
          className={`inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold ${
            isPositive ? "text-success" : "text-danger"
          }`}
        >
          {isPositive ? (
            <IconArrowUp width={12} height={12} />
          ) : (
            <IconArrowDown width={12} height={12} />
          )}
          {Math.abs(delta).toFixed(1)}%
        </span>
      </div>
      <div className="mt-2 -mx-1">
        <Sparkline values={values} />
      </div>
      {comparison && (
        <div className="mt-1 text-[11px] text-muted-2">{comparison}</div>
      )}
    </div>
  );
}
