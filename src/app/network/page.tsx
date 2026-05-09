'use client';

import { useMemo } from 'react';
import { Network, ArrowDown, ArrowUp, Activity } from 'lucide-react';
import { MetricCard, ChartCard } from '@/components/MetricCard';
import { LineChart } from '@/components/LineChart';
import { ExternalApiButton } from '@/components/ExternalApiButton';
import { formatBytes, formatCount } from '@/lib/formatters';
import { generateMockAppMetrics, generateMockServerMetrics } from '@/lib/mockData';

export default function NetworkPage() {
  const appMetrics = useMemo(() => generateMockAppMetrics(), []);
  const serverMetrics = useMemo(() => generateMockServerMetrics(), []);

  return (
    <div className="space-y-6">
      <ExternalApiButton />

      <div className="macos-card p-4">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Network Metrics</h2>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Inbound and outbound traffic for app and server interfaces.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="App Inbound" value={formatBytes(appMetrics.summary.networkInBytes)} hint="Total RX from Docker" icon={ArrowDown} />
        <MetricCard label="App Outbound" value={formatBytes(appMetrics.summary.networkOutBytes)} hint="Total TX from Docker" icon={ArrowUp} />
        <MetricCard label="Server RX" value={formatBytes(serverMetrics.network.rxBytes)} hint="All interfaces combined" icon={ArrowDown} />
        <MetricCard label="Server TX" value={formatBytes(serverMetrics.network.txBytes)} hint="All interfaces combined" icon={ArrowUp} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="App Network in / out" subtitle="Derived from Docker network counters">
          <LineChart
            points={appMetrics.resource}
            yFormatter={formatBytes}
            series={[
              { key: 'in', label: 'Inbound', color: '#0891b2', values: appMetrics.resource.map((p) => p.netRxBytes) },
              { key: 'out', label: 'Outbound', color: '#ea580c', values: appMetrics.resource.map((p) => p.netTxBytes) },
            ]}
          />
        </ChartCard>

        <ChartCard title="Server Network interfaces" subtitle="Per-interface RX/TX breakdown">
          <div className="space-y-3">
            {serverMetrics.network.interfaces.map((iface) => (
              <div
                key={iface.name}
                className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                    <Network className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{iface.name}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {iface.speedMbps ? `${iface.speedMbps} Mbps` : 'Virtual interface'}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs space-y-1">
                  <p className="text-neutral-600 dark:text-neutral-300">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 mr-1" />
                    RX {formatBytes(iface.rxBytes)}
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1" />
                    TX {formatBytes(iface.txBytes)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="macos-card p-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Server Network Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">RX Packets</p>
            <p className="mt-1 text-lg font-semibold">{formatCount(serverMetrics.network.rxPackets)}</p>
          </div>
          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">TX Packets</p>
            <p className="mt-1 text-lg font-semibold">{formatCount(serverMetrics.network.txPackets)}</p>
          </div>
          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">TCP Connections</p>
            <p className="mt-1 text-lg font-semibold">
              {formatCount(appMetrics.resource[appMetrics.resource.length - 1]?.tcpConnections)}
            </p>
          </div>
          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Listening Ports</p>
            <p className="mt-1 text-lg font-semibold">
              {appMetrics.resource[appMetrics.resource.length - 1]?.listeningPorts.length ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
