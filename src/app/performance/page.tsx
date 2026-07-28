'use client';

import { useMemo } from 'react';
import {
  Zap,
  Cpu,
  MemoryStick,
  HardDrive,
  Gauge,
  Activity,
  Clock3,
} from 'lucide-react';
import { MetricCard, ChartCard } from '@/components/MetricCard';
import { LineChart } from '@/components/LineChart';
import { ExternalApiButton } from '@/components/ExternalApiButton';
import { formatPercent, formatBytes } from '@/lib/formatters';
import { generateMockAppMetrics, generateMockServerMetrics } from '@/lib/mockData';

export default function PerformancePage() {
  const appMetrics = useMemo(() => generateMockAppMetrics(), []);
  const serverMetrics = useMemo(() => generateMockServerMetrics(), []);

  const latestResource = appMetrics.resource[appMetrics.resource.length - 1];

  return (
    <div className="space-y-6">
      <ExternalApiButton />

      <div className="macos-card p-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Performance Metrics Changes</h2>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          CPU, memory, disk I/O, and container-level resource usage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="App CPU" value={formatPercent(appMetrics.summary.avgCpuPct)} hint="Average over window" icon={Cpu} />
        <MetricCard label="App Memory" value={formatPercent(latestResource?.memPercent)} hint="Latest sample" icon={MemoryStick} />
        <MetricCard label="Server CPU" value={formatPercent(serverMetrics.cpu.usage)} hint={`${serverMetrics.cpu.cores} cores`} icon={Gauge} />
        <MetricCard label="Server Memory" value={formatPercent(serverMetrics.memory.usagePercent)} hint={`${formatBytes(serverMetrics.memory.used)} used`} icon={Activity} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="App CPU and memory" subtitle="Universal Docker App metrics">
          <LineChart
            points={appMetrics.resource}
            yFormatter={(value) => `${Math.round(value)}%`}
            series={[
              { key: 'cpu', label: 'CPU', color: '#2563eb', values: appMetrics.resource.map((p) => p.cpuPct) },
              { key: 'memory', label: 'Memory', color: '#7c3aed', values: appMetrics.resource.map((p) => p.memPercent) },
            ]}
          />
        </ChartCard>

        <ChartCard title="Server CPU over time" subtitle="Mock time-series data">
          <LineChart
            points={appMetrics.resource.map((p) => ({ timestamp: p.timestamp }))}
            yFormatter={(value) => `${Math.round(value)}%`}
            series={[
              {
                key: 'server-cpu',
                label: 'Server CPU',
                color: '#0891b2',
                values: appMetrics.resource.map((p) =>
                  Math.min(100, (p.cpuPct ?? 0) * 1.5 + Math.random() * 5)
                ),
              },
            ]}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Disk I/O" subtitle="Read / Write bytes from /proc/diskstats">
          <LineChart
            points={appMetrics.resource.map((p) => ({ timestamp: p.timestamp }))}
            yFormatter={formatBytes}
            series={[
              {
                key: 'disk-read',
                label: 'Read',
                color: '#16a34a',
                values: appMetrics.resource.map(() => serverMetrics.disk.readBytes + Math.random() * 100_000_000),
              },
              {
                key: 'disk-write',
                label: 'Write',
                color: '#d97706',
                values: appMetrics.resource.map(() => serverMetrics.disk.writeBytes + Math.random() * 80_000_000),
              },
            ]}
          />
        </ChartCard>

        <ChartCard title="Connections, restarts, health" subtitle="Latest container-level signals">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">TCP connections</p>
              <p className="mt-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {latestResource?.tcpConnections ?? 'n/a'}
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Restarts</p>
              <p className="mt-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {latestResource?.restartCount ?? 'n/a'}
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Health</p>
              <p className="mt-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
                {latestResource?.healthStatus || 'n/a'}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(latestResource?.listeningPorts || []).length > 0 ? (
              latestResource!.listeningPorts.map((port) => (
                <span
                  key={port}
                  className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-700 text-xs text-neutral-700 dark:text-neutral-300"
                >
                  :{port}
                </span>
              ))
            ) : (
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                No listening ports detected from Docker metadata.
              </span>
            )}
          </div>
        </ChartCard>
      </div>

      <div className="macos-card p-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Disk Mounts</h3>
        <div className="space-y-2">
          {serverMetrics.disk.mounts.map((mount) => (
            <div
              key={mount.mountpoint}
              className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-700"
            >
              <div className="flex items-center gap-3">
                <HardDrive className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                <div>
                  <p className="text-sm font-medium">{mount.mountpoint}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {mount.device} · {mount.filesystem}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatPercent(mount.usagePercent)}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatBytes(mount.used)} / {formatBytes(mount.total)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="macos-card p-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">System Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Hostname</p>
            <p className="font-medium mt-0.5">{serverMetrics.system.hostname}</p>
          </div>
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">OS</p>
            <p className="font-medium mt-0.5">{serverMetrics.system.os}</p>
          </div>
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Kernel</p>
            <p className="font-medium mt-0.5">{serverMetrics.system.kernel}</p>
          </div>
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Uptime</p>
            <p className="font-medium mt-0.5">{Math.floor(serverMetrics.system.uptime / 86400)}d {Math.floor((serverMetrics.system.uptime % 86400) / 3600)}h</p>
          </div>
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Load Average</p>
            <p className="font-medium mt-0.5">
              {serverMetrics.system.loadAverage.one.toFixed(2)} / {serverMetrics.system.loadAverage.five.toFixed(2)} / {serverMetrics.system.loadAverage.fifteen.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Processes</p>
            <p className="font-medium mt-0.5">{serverMetrics.system.processCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
