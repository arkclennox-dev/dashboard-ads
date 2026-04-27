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
  const stepX = values.length > 1 ? innerW / (values.length - 1) : innerW;

  const points = values
    .map((v, i) => `${padL + i * stepX},${padT + innerH - ((v - min) / range) * innerH}`)
    .join(" ");

  const ticks = Array.from({ length: yTickCount }, (_, i) => {
    const v = min + (range * i) / (yTickCount - 1);
    return { v, y: padT + innerH - ((v - min) / range) * innerH };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={padL}
            y1={t.y}
            x2={width - padR}
            y2={t.y}
            stroke="#1f2740"
            strokeDasharray="3 4"
          />
          <text x={4} y={t.y + 4} fontSize={10} fill="#5d667d">
            {formatY(t.v)}
          </text>
        </g>
      ))}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={padL + i * stepX}
          cy={padT + innerH - ((v - min) / range) * innerH}
          r={3}
          fill={color}
        />
      ))}
      {labels.map((label, i) => (
        <text
          key={i}
          x={padL + i * stepX}
          y={height - 8}
          fontSize={10}
          fill="#5d667d"
          textAnchor="middle"
        >
          {label}
        </text>
      ))}
    </svg>
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
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={padL}
            y1={t.y}
            x2={width - padR}
            y2={t.y}
            stroke="#1f2740"
            strokeDasharray="3 4"
          />
          <text x={4} y={t.y + 4} fontSize={10} fill="#5d667d">
            {formatY(t.v)}
          </text>
        </g>
      ))}
      {values.map((v, i) => {
        const h = ((v - min) / range) * innerH;
        const x = padL + i * slot + (slot - barW) / 2;
        const y = padT + innerH - h;
        return <rect key={i} x={x} y={y} width={barW} height={h} rx={3} fill={color} />;
      })}
      {labels.map((label, i) => (
        <text
          key={i}
          x={padL + i * slot + slot / 2}
          y={height - 8}
          fontSize={10}
          fill="#5d667d"
          textAnchor="middle"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}
