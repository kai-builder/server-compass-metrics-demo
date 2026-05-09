export interface HttpPoint {
  timestamp: number;
  requests: number;
  count2xx: number;
  count3xx: number;
  count4xx: number;
  count5xx: number;
  p50Ms: number | null;
  p95Ms: number | null;
  p99Ms: number | null;
}

export interface ResourcePoint {
  timestamp: number;
  cpuPct: number | null;
  memPercent: number | null;
  netRxBytes: number | null;
  netTxBytes: number | null;
  tcpConnections: number | null;
  restartCount: number | null;
  healthStatus: string | null;
  listeningPorts: number[];
  sampleCount: number | null;
}

export interface SlowPath {
  method: string;
  path: string;
  requests: number;
  count4xx: number;
  count5xx: number;
  p95Ms: number | null;
}

export interface HealthLog {
  ts: number;
  component: string;
  status: string;
  message: string | null;
}

export interface MetricsConfig {
  enabled: boolean;
  httpEnabled: boolean;
  lastSyncAt: number | null;
  lastError: string | null;
}

export interface AppMetricsQueryResult {
  config: MetricsConfig;
  resource: ResourcePoint[];
  http: HttpPoint[];
  slowPaths: SlowPath[];
  health: HealthLog[];
  summary: {
    requests: number | null;
    p95Ms: number | null;
    avgCpuPct: number | null;
    networkInBytes: number | null;
    networkOutBytes: number | null;
  };
  appType: string | null;
}

export interface ServerMetrics {
  timestamp: number;
  cpu: {
    cores: number;
    usage: number;
    model: string | null;
    frequencyGHz: number | null;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    available: number;
    usagePercent: number;
    swapTotal: number | null;
    swapUsed: number | null;
    swapUsagePercent: number | null;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
    readBytes: number;
    writeBytes: number;
    rootDevice: string | null;
    mounts: Array<{
      device: string;
      filesystem: string;
      mountpoint: string;
      total: number;
      used: number;
      available: number;
      usagePercent: number;
    }>;
  };
  network: {
    rxBytes: number;
    txBytes: number;
    rxPackets: number;
    txPackets: number;
    interfaces: Array<{
      name: string;
      rxBytes: number;
      txBytes: number;
      rxPackets: number;
      txPackets: number;
      speedMbps: number | null;
    }>;
  };
  system: {
    hostname: string | null;
    os: string | null;
    kernel: string | null;
    uptime: number;
    loadAverage: {
      one: number;
      five: number;
      fifteen: number;
    };
    processCount: number | null;
  };
  health: {
    status: 'healthy' | 'warning' | 'critical';
    score: number;
    summary: string;
    indicators: Array<{
      key: string;
      label: string;
      level: 'ok' | 'warning' | 'critical';
      value: string;
      hint: string;
    }>;
  };
  alerts: Array<{
    id: string;
    level: 'critical' | 'warning';
    title: string;
    description: string;
    actionLabel?: string;
  }>;
}

function generateTimestamps(count: number, intervalMs: number): number[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => now - (count - 1 - i) * intervalMs);
}

export function generateMockAppMetrics(): AppMetricsQueryResult {
  const httpCount = 24;
  const resourceCount = 24;
  const timestampsHttp = generateTimestamps(httpCount, 300_000); // 5 min intervals
  const timestampsResource = generateTimestamps(resourceCount, 300_000);

  const http: HttpPoint[] = timestampsHttp.map((ts, i) => {
    const baseRequests = 120 + Math.sin(i * 0.5) * 40 + Math.random() * 20;
    const requests = Math.round(baseRequests);
    const errRate = i > 18 ? 0.15 : 0.02;
    const count5xx = Math.round(requests * errRate * Math.random());
    const count4xx = Math.round(requests * 0.03 * Math.random());
    const count3xx = Math.round(requests * 0.08);
    const count2xx = requests - count5xx - count4xx - count3xx;
    return {
      timestamp: ts,
      requests,
      count2xx: Math.max(0, count2xx),
      count3xx: Math.max(0, count3xx),
      count4xx: Math.max(0, count4xx),
      count5xx: Math.max(0, count5xx),
      p50Ms: 45 + Math.random() * 30,
      p95Ms: 120 + Math.random() * 150 + (i > 18 ? 300 : 0),
      p99Ms: 250 + Math.random() * 400 + (i > 18 ? 500 : 0),
    };
  });

  const resource: ResourcePoint[] = timestampsResource.map((ts, i) => ({
    timestamp: ts,
    cpuPct: 15 + Math.sin(i * 0.3) * 10 + Math.random() * 5,
    memPercent: 45 + Math.sin(i * 0.2) * 5 + Math.random() * 3,
    netRxBytes: 500_000 + Math.random() * 200_000,
    netTxBytes: 300_000 + Math.random() * 150_000,
    tcpConnections: 120 + Math.round(Math.random() * 30),
    restartCount: i === 20 ? 1 : 0,
    healthStatus: i > 20 ? 'unhealthy' : 'healthy',
    listeningPorts: [3000, 8080, 5432],
    sampleCount: 3,
  }));

  const totalRequests = http.reduce((sum, p) => sum + p.requests, 0);
  const avgP95 = http.reduce((sum, p) => sum + (p.p95Ms ?? 0), 0) / http.length;
  const avgCpu = resource.reduce((sum, p) => sum + (p.cpuPct ?? 0), 0) / resource.length;
  const totalNetIn = resource.reduce((sum, p) => sum + (p.netRxBytes ?? 0), 0);
  const totalNetOut = resource.reduce((sum, p) => sum + (p.netTxBytes ?? 0), 0);

  const slowPaths: SlowPath[] = [
    { method: 'GET', path: '/api/content', requests: 3420, count4xx: 12, count5xx: 45, p95Ms: 420 },
    { method: 'POST', path: '/api/deploy', requests: 890, count4xx: 3, count5xx: 8, p95Ms: 1250 },
    { method: 'GET', path: '/dashboard/metrics', requests: 5600, count4xx: 5, count5xx: 0, p95Ms: 180 },
    { method: 'GET', path: '/api/servers', requests: 2100, count4xx: 8, count5xx: 2, p95Ms: 310 },
  ];

  const health: HealthLog[] = [
    { ts: Date.now() - 60_000, component: 'collector', status: 'ok', message: 'Metrics synced successfully' },
    { ts: Date.now() - 300_000, component: 'traefik', status: 'ok', message: 'Access logs rotated' },
    { ts: Date.now() - 600_000, component: 'docker', status: 'warning', message: 'Container restart detected' },
  ];

  return {
    config: {
      enabled: true,
      httpEnabled: true,
      lastSyncAt: Date.now() - 30_000,
      lastError: null,
    },
    resource,
    http,
    slowPaths,
    health,
    summary: {
      requests: totalRequests,
      p95Ms: avgP95,
      avgCpuPct: avgCpu,
      networkInBytes: totalNetIn,
      networkOutBytes: totalNetOut,
    },
    appType: 'http',
  };
}

export function generateMockServerMetrics(): ServerMetrics {
  return {
    timestamp: Date.now(),
    cpu: {
      cores: 4,
      usage: 32.5,
      model: 'Intel(R) Xeon(R) CPU E5-2680 v2 @ 2.80GHz',
      frequencyGHz: 2.8,
    },
    memory: {
      total: 16_106_127_360,
      used: 6_442_450_944,
      free: 2_147_483_648,
      available: 7_516_192_768,
      usagePercent: 40.0,
      swapTotal: 2_147_483_648,
      swapUsed: 134_217_728,
      swapUsagePercent: 6.25,
    },
    disk: {
      total: 107_374_182_400,
      used: 32_212_254_720,
      free: 70_000_000_000,
      usagePercent: 30.0,
      readBytes: 1_500_000_000,
      writeBytes: 800_000_000,
      rootDevice: '/dev/sda1',
      mounts: [
        { device: '/dev/sda1', filesystem: 'ext4', mountpoint: '/', total: 107_374_182_400, used: 32_212_254_720, available: 70_000_000_000, usagePercent: 30.0 },
        { device: '/dev/sdb1', filesystem: 'ext4', mountpoint: '/data', total: 536_870_912_000, used: 483_183_820_800, available: 40_000_000_000, usagePercent: 90.0 },
      ],
    },
    network: {
      rxBytes: 12_500_000_000,
      txBytes: 8_200_000_000,
      rxPackets: 45_000_000,
      txPackets: 38_000_000,
      interfaces: [
        { name: 'eth0', rxBytes: 10_000_000_000, txBytes: 7_000_000_000, rxPackets: 40_000_000, txPackets: 35_000_000, speedMbps: 1000 },
        { name: 'lo', rxBytes: 2_500_000_000, txBytes: 1_200_000_000, rxPackets: 5_000_000, txPackets: 3_000_000, speedMbps: null },
      ],
    },
    system: {
      hostname: 'demo-server-01',
      os: 'Ubuntu 22.04.4 LTS',
      kernel: 'Linux 5.15.0',
      uptime: 1_234_567,
      loadAverage: { one: 1.25, five: 1.10, fifteen: 0.95 },
      processCount: 142,
    },
    health: {
      status: 'warning',
      score: 65,
      summary: 'Performance requires attention',
      indicators: [
        { key: 'cpu', label: 'CPU Usage', level: 'ok', value: '32.5%', hint: 'CPU operating within normal range' },
        { key: 'memory', label: 'Memory Usage', level: 'ok', value: '40.0%', hint: 'Memory capacity is stable' },
        { key: 'disk', label: 'Disk Usage', level: 'warning', value: '90.0%', hint: 'Disk usage is trending high' },
      ],
    },
    alerts: [
      { id: 'indicator-disk', level: 'warning', title: 'Disk Usage', description: 'Disk usage is trending high' },
      { id: 'mount-/data', level: 'warning', title: 'Disk usage high on /data', description: '90.0% used on /dev/sdb1', actionLabel: 'View storage' },
    ],
  };
}
