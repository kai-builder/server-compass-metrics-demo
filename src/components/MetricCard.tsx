'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}

export function MetricCard({ label, value, hint, icon: Icon }: MetricCardProps) {
  return (
    <div className="macos-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
          )}
        </div>
        <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
          <Icon className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
        </div>
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <section className="macos-card p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
        {subtitle && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

interface EmptyPanelProps {
  title: string;
  message: string;
}

export function EmptyPanel({ title, message }: EmptyPanelProps) {
  return (
    <div className="h-[220px] flex flex-col items-center justify-center text-center px-6">
      <BarChart3Icon className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mb-3" />
      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{title}</p>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">{message}</p>
    </div>
  );
}

function BarChart3Icon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}
