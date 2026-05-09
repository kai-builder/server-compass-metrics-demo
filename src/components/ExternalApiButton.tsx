'use client';

import { useState } from 'react';
import { Loader2, Globe } from 'lucide-react';

interface ApiResult {
  success: boolean;
  data?: unknown;
  error?: string;
  status?: number;
  headers?: Record<string, string>;
}

export function ExternalApiButton() {
  const [result, setResult] = useState<ApiResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch('https://servercompass.app/api/content', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      let data: unknown;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      setResult({
        success: response.ok,
        data,
        status: response.status,
        headers,
      });
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="macos-card p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">External API Test</h3>
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
        Call <code className="bg-neutral-100 dark:bg-neutral-700 px-1 py-0.5 rounded text-[11px]">https://servercompass.app/api/content</code> to test outbound metrics.
      </p>
      <button
        type="button"
        onClick={handleFetch}
        disabled={isLoading}
        className="macos-btn-primary"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
        {isLoading ? 'Fetching...' : 'Call External API'}
      </button>

      {result && (
        <div className="mt-4">
          {result.success ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 font-medium">
                  HTTP {result.status}
                </span>
              </div>
              {result.headers && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-neutral-600 dark:text-neutral-300 font-medium">
                    Response Headers
                  </summary>
                  <pre className="mt-2 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 overflow-auto max-h-40 text-[11px]">
                    {JSON.stringify(result.headers, null, 2)}
                  </pre>
                </details>
              )}
              <details className="text-xs" open>
                <summary className="cursor-pointer text-neutral-600 dark:text-neutral-300 font-medium">
                  Response Body
                </summary>
                <pre className="mt-2 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 overflow-auto max-h-60 text-[11px]">
                  {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
              <p className="font-medium">Request failed</p>
              <p className="text-xs mt-1">{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
