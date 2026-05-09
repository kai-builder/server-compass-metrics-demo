'use client';

import { useMemo } from 'react';
import { EmptyPanel } from './MetricCard';
import { formatTime } from '@/lib/formatters';

interface LineChartProps {
  points: Array<{ timestamp: number }>;
  series: Array<{
    key: string;
    label: string;
    color: string;
    values: Array<number | null>;
  }>;
  yFormatter?: (value: number) => string;
}

export function LineChart({ points, series, yFormatter = (value: number) => String(Math.round(value)) }: LineChartProps) {
  const width = 640;
  const height = 220;
  const padding = { top: 18, right: 16, bottom: 28, left: 46 };

  const values = useMemo(
    () => series.flatMap((item) => item.values).filter((value): value is number => value !== null && Number.isFinite(value)),
    [series]
  );

  if (points.length === 0 || values.length === 0) {
    return <EmptyPanel title="No samples yet" message="Metrics will fill in after the next collection tick." />;
  }

  const min = Math.min(0, ...values);
  const max = Math.max(...values, min + 1);
  const xFor = (index: number) =>
    padding.left + (index / Math.max(1, points.length - 1)) * (width - padding.left - padding.right);
  const yFor = (value: number) =>
    padding.top + (1 - (value - min) / Math.max(1, max - min)) * (height - padding.top - padding.bottom);

  return (
    <div>
      <svg className="w-full h-[220px]" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Line chart">
        {[0, 0.5, 1].map((tick) => {
          const y = padding.top + tick * (height - padding.top - padding.bottom);
          const labelValue = max - tick * (max - min);
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="currentColor"
                className="text-neutral-200 dark:text-neutral-700"
                strokeWidth="1"
              />
              <text x={8} y={y + 4} className="fill-neutral-400 dark:fill-neutral-500 text-[11px]">
                {yFormatter(labelValue)}
              </text>
            </g>
          );
        })}
        {series.map((item) => {
          const path = item.values
            .map((value, index) => (value === null ? null : `${xFor(index)},${yFor(value)}`))
            .filter(Boolean)
            .join(' ');
          return (
            <polyline
              key={item.key}
              points={path}
              fill="none"
              stroke={item.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
        <text x={padding.left} y={height - 8} className="fill-neutral-400 dark:fill-neutral-500 text-[11px]">
          {formatTime(points[0].timestamp)}
        </text>
        <text x={width - padding.right - 44} y={height - 8} className="fill-neutral-400 dark:fill-neutral-500 text-[11px]">
          {formatTime(points[points.length - 1].timestamp)}
        </text>
      </svg>
      <div className="flex flex-wrap gap-3 mt-2">
        {series.map((item) => (
          <div key={item.key} className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
