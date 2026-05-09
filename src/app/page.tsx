'use client';

import { useMemo } from 'react';
import {
  Activity,
  BarChart3,
  Clock3,
  Gauge,
  Network,
  AlertTriangle,
  Server,
  HardDrive,
  MemoryStick,
  Cpu,
} from 'lucide-react';
import { MetricCard, ChartCard } from '@/components/MetricCard';
import { LineChart } from '@/components/LineChart';
import { StatusBarChart } from '@/components/StatusBarChart';
import { ExternalApiButton } from '@/components/ExternalApiButton';
import { formatPercent, formatMs, formatBytes, formatCount } from '@/lib/formatters';
import { generateMockAppMetrics, generateMockServerMetrics } from '@/lib/mockData';

export default function DashboardPage() {
  const appMetrics = useMemo(() => generateMockAppMetrics(), []);
  const serverMetrics = useMemo(() => generateMockServerMetrics(), []);

  const latestResource = appMetrics.resource.length ? appMetrics.resource[appMetrics.resource.length - 1] : null;
  const appTypeLabel = appMetrics.appType === 'http' ? 'HTTP App' : 'Docker App';

  return (
    <div className="space-y-6">
      <ExternalApiButton />

      <div className="macos-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">App Metrics</h2>
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-xs text-neutral-600 dark:text-neutral-300">
                {appTypeLabel}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Last sync {appMetrics.config.lastSyncAt ? new Date(appMetrics.config.lastSyncAt).toLocaleTimeString() : 'pending'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="Requests" value={formatCount(appMetrics.summary.requests)} hint="24h total" icon={BarChart3} />
        <MetricCard label="p95 latency" value={formatMs(appMetrics.summary.p95Ms)} hint="Traefik edge timing" icon={Clock3} />
        <MetricCard label="CPU avg" value={formatPercent(appMetrics.summary.avgCpuPct)} hint={`${latestResource?.sampleCount} container samples`} icon={Gauge} />
        <MetricCard label="Network" value={`${formatBytes(appMetrics.summary.networkInBytes)} in`} hint={`${formatBytes(appMetrics.summary.networkOutBytes)} out`} icon={Network} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Requests by status code" subtitle="Stacked by 2xx, 3xx, 4xx, 5xx">
          <StatusBarChart points={appMetrics.http} />
        </ChartCard>

        <ChartCard title="Response time" subtitle="p50, p95, p99 from Traefik access logs">
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

        <ChartCard title="CPU and memory" subtitle="Universal Docker App metrics">
          <LineChart
            points={appMetrics.resource}
            yFormatter={(value) => `${Math.round(value)}%`}
            series={[
              { key: 'cpu', label: 'CPU', color: '#2563eb', values: appMetrics.resource.map((p) => p.cpuPct) },
              { key: 'memory', label: 'Memory', color: '#7c3aed', values: appMetrics.resource.map((p) => p.memPercent) },
            ]}
          />
        </ChartCard>

        <ChartCard title="Network in / out" subtitle="Derived from Docker network counters">
          <LineChart
            points={appMetrics.resource}
            yFormatter={formatBytes}
            series={[
              { key: 'in', label: 'Inbound', color: '#0891b2', values: appMetrics.resource.map((p) => p.netRxBytes) },
              { key: 'out', label: 'Outbound', color: '#ea580c', values: appMetrics.resource.map((p) => p.netTxBytes) },
            ]}
          />
        </ChartCard>
      </div>

      <div className="macos-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Server className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Server Overview</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">CPU</p>
              <p className="text-sm font-semibold">{serverMetrics.cpu.cores} cores · {formatPercent(serverMetrics.cpu.usage)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <MemoryStick className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Memory</p>
              <p className="text-sm font-semibold">{formatBytes(serverMetrics.memory.used)} / {formatBytes(serverMetrics.memory.total)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <HardDrive className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Disk</p>
              <p className="text-sm font-semibold">{formatPercent(serverMetrics.disk.usagePercent)} used</p>
            </div>
          </div>
        </div>

        {serverMetrics.alerts.length > 0 && (
          <div className="mt-4 space-y-2">
            {serverMetrics.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                  alert.level === 'critical'
                    ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                    : 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-xs mt-0.5 opacity-80">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
