"use client";

import { useRef, useState } from "react";

interface SparklineProps {
  values: number[];
  color?: string;
  height?: number;
  className?: string;
}

export function Sparkline({
  values,
  color = "#3b82f6",
  height = 56,
  className,
}: SparklineProps) {
  if (values.length === 0) return null;
  const width = 220;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1 || 1);
  const points = values
    .map((v, i) => `${i * stepX},${height - ((v - min) / range) * (height - 8) - 4}`)
    .join(" ");
  const area = `0,${height} ${points} ${width},${height}`;
  const id = `spark-${color.replace("#", "")}-${values.length}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      className={className}
    >
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface LineChartProps {
  values: number[];
  labels: string[];
  color?: string;
  height?: number;
  yTickCount?: number;
  formatY?: (n: number) => string;
}

export function LineChart({
  values,
  labels,
  color = "#3b82f6",
  height = 200,
  yTickCount = 5,
  formatY = (n) => Math.round(n).toString(),
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; value: string } | null>(null);

  const width = 640;
  const padL = 36;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const allVals = values.length ? values : [0];
  const dataMin = Math.min(...allVals);
  const max = Math.max(...allVals, 0) * 1.1 || 1;
  const min = dataMin < 0 ? dataMin * 1.1 : 0;
  const range = max - min || 1;
  const stepX = values.length > 1 ? innerW / (values.length - 1) : innerW;

  const cx = (i: number) => padL + i * stepX;
  const cy = (v: number) => padT + innerH - ((v - min) / range) * innerH;

  const points = values.map((v, i) => `${cx(i)},${cy(v)}`).join(" ");

  const ticks = Array.from({ length: yTickCount }, (_, i) => {
    const v = min + (range * i) / (yTickCount - 1);
    return { v, y: cy(v) };
  });

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg || values.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * width;
    const relX = svgX - padL;
    const idx = Math.round(relX / stepX);
    const clamped = Math.max(0, Math.min(values.length - 1, idx));
    const px = cx(clamped);
    const py = cy(values[clamped]);
    // Convert SVG coords back to screen coords
    const screenX = rect.left + (px / width) * rect.width;
    const screenY = rect.top + (py / height) * rect.height;
    setTooltip({
      x: e.clientX - rect.left,
      y: (py / height) * rect.height,
      label: labels[clamped] ?? "",
      value: formatY(values[clamped]),
    });
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        className="cursor-crosshair"
      >
        {/* Zero line if values go negative */}
        {min < 0 && (
          <line
            x1={padL} y1={cy(0)} x2={width - padR} y2={cy(0)}
            stroke="#ef4444" strokeWidth={1} strokeDasharray="4 3" opacity={0.5}
          />
        )}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} y1={t.y} x2={width - padR} y2={t.y} stroke="#1f2740" strokeDasharray="3 4" />
            <text x={4} y={t.y + 4} fontSize={10} fill="#5d667d">{formatY(t.v)}</text>
          </g>
        ))}
        <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {values.map((v, i) => (
          <circle key={i} cx={cx(i)} cy={cy(v)} r={3} fill={color} />
        ))}
        {/* Hover crosshair dot */}
        {tooltip && values.length > 0 && (() => {
          const idx = labels.indexOf(tooltip.label);
          if (idx < 0) return null;
          return <circle cx={cx(idx)} cy={cy(values[idx])} r={5} fill={color} stroke="white" strokeWidth={2} />;
        })()}
        {labels.map((label, i) => (
          <text key={i} x={cx(i)} y={height - 8} fontSize={10} fill="#5d667d" textAnchor="middle">{label}</text>
        ))}
      </svg>
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs shadow-lg"
          style={{ left: tooltip.x + 12, top: Math.max(0, tooltip.y - 36) }}
        >
          <div className="text-muted">{tooltip.label}</div>
          <div className="font-semibold text-ink" style={{ color }}>{tooltip.value}</div>
        </div>
      )}
    </div>
  );
}

interface BarChartProps {
  values: number[];
  labels: string[];
  color?: string;
  height?: number;
  yTickCount?: number;
  formatY?: (n: number) => string;
}

export function BarChart({
  values,
  labels,
  color = "#3b82f6",
  height = 200,
  yTickCount = 5,
  formatY = (n) => Math.round(n).toString(),
}: BarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 640;
  const padL = 36;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const max = Math.max(...values, 0) * 1.1 || 1;
  const min = 0;
  const range = max - min || 1;
  const slot = innerW / values.length;
  const barW = Math.max(slot * 0.55, 6);

  const ticks = Array.from({ length: yTickCount }, (_, i) => {
    const v = min + (range * i) / (yTickCount - 1);
    return { v, y: padT + innerH - ((v - min) / range) * innerH };
  });

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        className="cursor-crosshair"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} y1={t.y} x2={width - padR} y2={t.y} stroke="#1f2740" strokeDasharray="3 4" />
            <text x={4} y={t.y + 4} fontSize={10} fill="#5d667d">{formatY(t.v)}</text>
          </g>
        ))}
        {values.map((v, i) => {
          const h = ((v - min) / range) * innerH;
          const x = padL + i * slot + (slot - barW) / 2;
          const y = padT + innerH - h;
          const barCx = padL + i * slot + slot / 2;
          return (
            <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
              <rect x={x} y={y} width={barW} height={h} rx={3} fill={color} opacity={hoveredIdx === null || hoveredIdx === i ? 1 : 0.4} />
              {hoveredIdx === i && (
                <text x={barCx} y={Math.max(y - 4, padT + 10)} fontSize={10} fill={color} textAnchor="middle" fontWeight="600">
                  {formatY(v)}
                </text>
              )}
            </g>
          );
        })}
        {labels.map((label, i) => (
          <text key={i} x={padL + i * slot + slot / 2} y={height - 8} fontSize={10} fill="#5d667d" textAnchor="middle">{label}</text>
        ))}
      </svg>
      {hoveredIdx !== null && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs shadow-lg"
          style={{
            left: `calc(${((padL + hoveredIdx * slot + slot / 2) / width) * 100}% + 8px)`,
            top: 8,
          }}
        >
          <div className="text-muted">{labels[hoveredIdx]}</div>
          <div className="font-semibold" style={{ color }}>{formatY(values[hoveredIdx])}</div>
        </div>
      )}
    </div>
  );
}
