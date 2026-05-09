'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BarChart3,
  Globe,
  Zap,
  Network,
  Server,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/network', label: 'Network', icon: Network },
  { href: '/http-status', label: 'HTTP Status', icon: Globe },
  { href: '/performance', label: 'Performance', icon: Zap },
  { href: '/server-health', label: 'Server Health', icon: Server },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="macos-card mb-6 p-4">
      <div className="flex items-center gap-3 mb-4">
        <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h1 className="text-lg font-semibold">Server Compass Metrics Demo</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
