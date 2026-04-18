'use client';

import { useEffect, useState } from 'react';

import { frontendEnv } from '@/config/env';

type BackendHealth = {
  status: string;
  service: string;
  timestamp: string;
};

export function BackendStatusCard() {
  const [data, setData] = useState<BackendHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadHealth = async () => {
      try {
        const response = await fetch(`${frontendEnv.apiBaseUrl}/health`);

        if (!response.ok) {
          throw new Error(`Permintaan gagal dengan status ${response.status}`);
        }

        const payload = (await response.json()) as BackendHealth;

        if (isMounted) {
          setData(payload);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to reach backend');
        }
      }
    };

    loadHealth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="rounded-3xl border border-white/60 bg-slate-950 p-6 text-white shadow-glow">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Backend link</p>
      <div className="mt-4">
        {error ? (
          <p className="text-sm leading-6 text-rose-300">{error}</p>
        ) : data ? (
          <>
            <p className="text-2xl font-semibold">{data.status.toUpperCase()}</p>
            <p className="mt-2 text-sm text-slate-300">Service: {data.service}</p>
            <p className="mt-1 text-xs text-slate-400">Last checked: {data.timestamp}</p>
          </>
        ) : (
          <p className="text-sm text-slate-300">Checking backend via /api/health...</p>
        )}
      </div>
    </div>
  );
}