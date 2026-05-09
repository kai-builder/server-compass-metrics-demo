'use client';

import { useMemo } from 'react';
import { Globe, BarChart3, Clock3, AlertTriangle } from 'lucide-react';
import { MetricCard, ChartCard } from '@/components/MetricCard';
import { LineChart } from '@/components/LineChart';
import { StatusBarChart } from '@/components/StatusBarChart';
import { ExternalApiButton } from '@/components/ExternalApiButton';
import { formatCount, formatMs } from '@/lib/formatters';
import { generateMockAppMetrics } from '@/lib/mockData';

export default function HttpStatusPage() {
  const appMetrics = useMemo(() => generateMockAppMetrics(), []);

  const statusCounts = useMemo(() => {
    return appMetrics.http.reduce(
      (acc, point) => {
        acc['2xx'] += point.count2xx;
        acc['3xx'] += point.count3xx;
        acc['4xx'] += point.count4xx;
        acc['5xx'] += point.count5xx;
        return acc;
      },
      { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 }
    );
  }, [appMetrics.http]);

  const errorRate = useMemo(() => {
    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    return ((statusCounts['4xx'] + statusCounts['5xx']) / total) * 100;
  }, [statusCounts]);

  return (
    <div className="space-y-6">
      <ExternalApiButton />

      <div className="macos-card p-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">HTTP Status Metrics</h2>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Request volumes, status code distribution, and latency percentiles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="Total Requests" value={formatCount(appMetrics.summary.requests)} hint="24h window" icon={BarChart3} />
        <MetricCard label="p95 Latency" value={formatMs(appMetrics.summary.p95Ms)} hint="Edge response time" icon={Clock3} />
        <MetricCard label="Error Rate" value={`${errorRate.toFixed(2)}%`} hint="4xx + 5xx / total" icon={AlertTriangle} />
        <MetricCard label="Status Codes" value={`${Object.keys(statusCounts).length} classes`} hint="2xx, 3xx, 4xx, 5xx" icon={Globe} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Requests by status code" subtitle="Stacked by 2xx, 3xx, 4xx, 5xx">
          <StatusBarChart points={appMetrics.http} />
        </ChartCard>

        <ChartCard title="Response time percentiles" subtitle="p50, p95, p99 from Traefik access logs">
          <LineChart
            points={appMetrics.http}
            yFormatter={(value) => `${Math.round(value)} ms`}
            series={[
              { key: 'p50', label: 'p50', color: '#16a34a', values: appMetrics.http.map((p) => p.p50Ms) },
              { key: 'p95', label: 'p95', color: '#2563eb', values: appMetrics.http.map((p) => p.p95Ms) },
              { key: 'p99', label: 'p99', color: '#dc2626', values: appMetrics.http.map((p) => p.p99Ms) },
            ]}
          />
        </ChartCard>
      </div>

      <ChartCard title="Slow paths" subtitle="Top routes from recent Traefik samples">
        {appMetrics.slowPaths.length ? (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {appMetrics.slowPaths.map((path) => (
              <div key={`${path.method}-${path.path}`} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-[10px] font-mono mr-2">
                      {path.method || 'GET'}
                    </span>
                    {path.path}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {formatCount(path.requests)} req · {path.count4xx} 4xx · {path.count5xx} 5xx
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{formatMs(path.p95Ms)}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">p95</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[220px] flex flex-col items-center justify-center text-center px-6">
            <Globe className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mb-3" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">No slow paths yet</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
              Slow-path rows appear after routed HTTP traffic is observed.
            </p>
          </div>
        )}
      </ChartCard>

      <div className="macos-card p-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Status Code Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {([
            ['2xx Success', statusCounts['2xx'], '#16a34a'],
            ['3xx Redirect', statusCounts['3xx'], '#2563eb'],
            ['4xx Client Error', statusCounts['4xx'], '#d97706'],
            ['5xx Server Error', statusCounts['5xx'], '#dc2626'],
          ] as const).map(([label, count, color]) => (
            <div key={label} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
              <p className="mt-1 text-xl font-semibold" style={{ color }}>
                {formatCount(count)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
