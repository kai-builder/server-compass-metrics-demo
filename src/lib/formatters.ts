export const formatPercent = (value: number | null | undefined): string =>
  value === null || value === undefined ? 'n/a' : `${value.toFixed(value >= 10 ? 0 : 1)}%`;

export const formatMs = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'n/a';
  if (value < 1000) return `${value.toFixed(value >= 100 ? 0 : 1)} ms`;
  return `${(value / 1000).toFixed(2)} s`;
};

export const formatBytes = (value: number | null | undefined): string => {
  const bytes = value || 0;
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let amount = bytes / 1024;
  let index = 0;
  while (amount >= 1024 && index < units.length - 1) {
    amount /= 1024;
    index += 1;
  }
  return `${amount.toFixed(amount >= 10 ? 1 : 2)} ${units[index]}`;
};

export const formatCount = (value: number | null | undefined): string =>
  value === null || value === undefined ? 'n/a' : Intl.NumberFormat().format(value);

export const formatTime = (timestamp: number): string =>
  new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
