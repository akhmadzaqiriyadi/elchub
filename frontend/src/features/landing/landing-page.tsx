import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

import { AuthPanel } from '@/features/auth/components/auth-panel';

import { BackendStatusCard } from './components/backend-status-card';
import { HighlightCard } from './components/highlight-card';
import { landingHighlights } from './data';

export function LandingPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_38%),linear-gradient(180deg,_#fbf7f2_0%,_#f6efe6_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_36%),linear-gradient(180deg,_#0b1220_0%,_#111827_100%)] dark:text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_20%_20%,rgba(217,119,6,0.18),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(15,118,110,0.16),transparent_26%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.14),transparent_28%)]" />

      <section className="container flex min-h-screen flex-col justify-center py-16">
        <div className="mb-6 flex justify-end">
          <ThemeToggle />
        </div>
        <div className="max-w-4xl animate-fade-in-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Boilerplate frontend siap lanjut build
          </div>

          <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-6xl lg:text-7xl dark:text-slate-100">
            Kerangka FE yang bersih, modern, dan gampang dikembangkan.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
            Setup ini ngikutin arah referensi: Next.js App Router, TypeScript, Tailwind, plus fondasi
            struktur yang enak dipakai untuk fitur berikutnya.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="#highlights" size="lg">
              Lihat fondasi
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/auth" variant="secondary" size="lg">
              Buka Auth Pages
            </Button>
          </div>
        </div>

        <div id="highlights" className="mt-16 grid gap-4 lg:grid-cols-3">
          {landingHighlights.map((item, index) => (
            <HighlightCard
              key={item.title}
              title={item.title}
              description={item.description}
              icon={item.icon}
              delayMs={index * 120}
            />
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <BackendStatusCard />
          <AuthPanel />
        </div>
      </section>
    </main>
  );
}