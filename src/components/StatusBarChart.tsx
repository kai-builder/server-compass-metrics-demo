'use client';

import { EmptyPanel } from './MetricCard';
import { formatCount, formatTime } from '@/lib/formatters';

interface HttpPoint {
  timestamp: number;
  requests: number;
  count2xx: number;
  count3xx: number;
  count4xx: number;
  count5xx: number;
}

interface StatusBarChartProps {
  points: HttpPoint[];
}

export function StatusBarChart({ points }: StatusBarChartProps) {
  const width = 640;
  const height = 220;
  const padding = { top: 12, right: 16, bottom: 26, left: 42 };
  const sampled = points.length > 80 ? points.filter((_, index) => index % Math.ceil(points.length / 80) === 0) : points;
  const max = Math.max(1, ...sampled.map((point) => point.requests));
  const barGap = 2;
  const plotWidth = width - padding.left - padding.right;
  const barWidth = Math.max(2, (plotWidth - barGap * Math.max(0, sampled.length - 1)) / Math.max(1, sampled.length));

  if (points.length === 0 || points.every((point) => point.requests === 0)) {
    return <EmptyPanel title="No HTTP requests yet" message="HTTP charts populate for apps routed through managed Traefik." />;
  }

  return (
    <div>
      <svg className="w-full h-[220px]" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="HTTP status chart">
        {[0, 0.5, 1].map((tick) => {
          const y = padding.top + tick * (height - padding.top - padding.bottom);
          return (
            <line
              key={tick}
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="currentColor"
              className="text-neutral-200 dark:text-neutral-700"
              strokeWidth="1"
            />
          );
        })}
        {sampled.map((point, index) => {
          const x = padding.left + index * (barWidth + barGap);
          let yCursor = height - padding.bottom;
          const segments = [
            { value: point.count2xx, color: '#16a34a' },
            { value: point.count3xx, color: '#2563eb' },
            { value: point.count4xx, color: '#d97706' },
            { value: point.count5xx, color: '#dc2626' },
          ];
          return (
            <g key={`${point.timestamp}-${index}`}>
              {segments.map((segment, segmentIndex) => {
                const segmentHeight = (segment.value / max) * (height - padding.top - padding.bottom);
                yCursor -= segmentHeight;
                return (
                  <rect
                    key={segmentIndex}
                    x={x}
                    y={yCursor}
                    width={barWidth}
                    height={Math.max(0, segmentHeight)}
                    fill={segment.color}
                    rx="1"
                  />
                );
              })}
            </g>
          );
        })}
        <text x={8} y={padding.top + 4} className="fill-neutral-400 dark:fill-neutral-500 text-[11px]">
          {formatCount(max)}
        </text>
        <text x={padding.left} y={height - 8} className="fill-neutral-400 dark:fill-neutral-500 text-[11px]">
          {formatTime(points[0].timestamp)}
        </text>
        <text x={width - padding.right - 44} y={height - 8} className="fill-neutral-400 dark:fill-neutral-500 text-[11px]">
          {formatTime(points[points.length - 1].timestamp)}
        </text>
      </svg>
      <div className="flex flex-wrap gap-3 mt-2">
        {[
          ['2xx', '#16a34a'],
          ['3xx', '#2563eb'],
          ['4xx', '#d97706'],
          ['5xx', '#dc2626'],
        ].map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
