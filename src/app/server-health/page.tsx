'use client';

import { useMemo } from 'react';
import { Server, Activity, AlertTriangle, CheckCircle2, Cpu, MemoryStick, HardDrive } from 'lucide-react';
import { MetricCard, ChartCard } from '@/components/MetricCard';
import { ExternalApiButton } from '@/components/ExternalApiButton';
import { formatPercent } from '@/lib/formatters';
import { generateMockServerMetrics } from '@/lib/mockData';

export default function ServerHealthPage() {
  const serverMetrics = useMemo(() => generateMockServerMetrics(), []);
  const { health, alerts } = serverMetrics;

  const statusColor =
    health.status === 'healthy'
      ? 'text-green-600 dark:text-green-400'
      : health.status === 'warning'
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400';

  const statusBg =
    health.status === 'healthy'
      ? 'bg-green-50 dark:bg-green-900/20'
      : health.status === 'warning'
      ? 'bg-amber-50 dark:bg-amber-900/20'
      : 'bg-red-50 dark:bg-red-900/20';

  const StatusIcon = health.status === 'healthy' ? CheckCircle2 : AlertTriangle;

  return (
    <div className="space-y-6">
      <ExternalApiButton />

      <div className="macos-card p-4">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Server Health</h2>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Health score, indicators, and alerts derived from server resource metrics.
        </p>
      </div>

      <div className="macos-card p-6 text-center">
        <div className={`mx-auto w-16 h-16 rounded-2xl ${statusBg} flex items-center justify-center mb-4`}>
          <StatusIcon className={`w-8 h-8 ${statusColor}`} />
        </div>
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 capitalize">{health.status}</h3>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{health.summary}</p>
        <div className="mt-4 mx-auto max-w-xs">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-neutral-500 dark:text-neutral-400">Health Score</span>
            <span className="font-semibold">{health.score}/100</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                health.score >= 80
                  ? 'bg-green-500'
                  : health.score >= 50
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${health.score}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {health.indicators.map((indicator) => {
          const Icon =
            indicator.key === 'cpu' ? Cpu : indicator.key === 'memory' ? MemoryStick : HardDrive;
          const levelColor =
            indicator.level === 'ok'
              ? 'text-green-600 dark:text-green-400'
              : indicator.level === 'warning'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-red-600 dark:text-red-400';
          const levelBg =
            indicator.level === 'ok'
              ? 'bg-green-50 dark:bg-green-900/20'
              : indicator.level === 'warning'
              ? 'bg-amber-50 dark:bg-amber-900/20'
              : 'bg-red-50 dark:bg-red-900/20';

          return (
            <div key={indicator.key} className="macos-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    {indicator.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {indicator.value}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{indicator.hint}</p>
                </div>
                <div className={`w-9 h-9 rounded-lg ${levelBg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${levelColor}`} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${levelBg} ${levelColor}`}
                >
                  {indicator.level}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <ChartCard title="Alerts" subtitle={`${alerts.length} active alert${alerts.length === 1 ? '' : 's'}`}>
        {alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  alert.level === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : 'bg-amber-50 dark:bg-amber-900/20'
                }`}
              >
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    alert.level === 'critical'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-medium ${
                        alert.level === 'critical'
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-amber-800 dark:text-amber-200'
                      }`}
                    >
                      {alert.title}
                    </p>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                        alert.level === 'critical'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}
                    >
                      {alert.level}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      alert.level === 'critical'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {alert.description}
                  </p>
                </div>
                {alert.actionLabel && (
                  <button
                    type="button"
                    className="macos-btn text-xs shrink-0"
                  >
                    {alert.actionLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[220px] flex flex-col items-center justify-center text-center px-6">
            <CheckCircle2 className="w-8 h-8 text-green-500 mb-3" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">No active alerts</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
              All health indicators are within normal ranges.
            </p>
          </div>
        )}
      </ChartCard>

      <div className="macos-card p-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Resource Thresholds</h3>
        <div className="space-y-4">
          {[
            { label: 'CPU', value: serverMetrics.cpu.usage, thresholds: [75, 90], icon: Cpu },
            { label: 'Memory', value: serverMetrics.memory.usagePercent, thresholds: [80, 90], icon: MemoryStick },
            { label: 'Disk', value: serverMetrics.disk.usagePercent, thresholds: [85, 95], icon: HardDrive },
          ].map((item) => {
            const Icon = item.icon;
            const warningThreshold = item.thresholds[0];
            const criticalThreshold = item.thresholds[1];
            const level =
              item.value >= criticalThreshold ? 'critical' : item.value >= warningThreshold ? 'warning' : 'ok';
            const barColor =
              level === 'critical' ? 'bg-red-500' : level === 'warning' ? 'bg-amber-500' : 'bg-green-500';

            return (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">{item.label}</span>
                  </div>
                  <span className="font-semibold">{formatPercent(item.value)}</span>
                </div>
                <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${Math.min(100, item.value)}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-px bg-neutral-400 dark:bg-neutral-500"
                    style={{ left: `${warningThreshold}%` }}
                    title={`Warning at ${warningThreshold}%`}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-px bg-red-400 dark:bg-red-500"
                    style={{ left: `${criticalThreshold}%` }}
                    title={`Critical at ${criticalThreshold}%`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  <span>0%</span>
                  <span>Warning {warningThreshold}%</span>
                  <span>Critical {criticalThreshold}%</span>
                  <span>100%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
