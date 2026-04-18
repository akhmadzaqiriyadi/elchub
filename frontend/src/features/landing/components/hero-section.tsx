import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '../hooks/use-scroll-animation';

interface HeroSectionProps {
  onCtaPrimary?: () => void;
  onCtaSecondary?: () => void;
}

export function HeroSection({ onCtaPrimary, onCtaSecondary }: HeroSectionProps) {
  const ref = useScrollAnimation({ delay: 0, duration: 0.8 });

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="container relative flex min-h-screen flex-col justify-center py-16 sm:py-24"
    >
      {/* Badge */}
      <div className="mb-8 inline-flex w-fit animate-fade-in-up items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Hub Terpercaya untuk Koneksi & Edukasi
      </div>

      {/* Main Headline */}
      <h1 className="max-w-4xl animate-fade-in-up text-5xl font-bold leading-tight tracking-tight text-[#2E417B] sm:text-6xl lg:text-7xl dark:text-white">
        Hub Terpercaya untuk Belajar, Berjejaring, dan Berkembang.
      </h1>

      {/* Sub-headline */}
      <p className="mt-6 max-w-3xl animate-fade-in-up text-lg leading-8 text-slate-700 sm:text-xl dark:text-slate-300">
        Temukan berbagai event mulai dari webinar gratis, workshop intensif, hingga mentoring eksklusif. Semua dalam satu koneksi di UCH Connection.
      </p>

      {/* CTA Buttons */}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-3">
        <Button
          size="lg"
          onClick={onCtaPrimary}
          className="bg-[#2E417B] hover:bg-[#1f2a52] dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Cek Jadwal Event Terdekat
          <ArrowRight className="h-5 w-5" />
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={onCtaSecondary}
          className="border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
        >
          <Play className="h-5 w-5" />
          Gabung Komunitas (Gratis)
        </Button>
      </div>
    </section>
  );
}
