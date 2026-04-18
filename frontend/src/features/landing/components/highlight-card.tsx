import type { LucideIcon } from 'lucide-react';

type HighlightCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  delayMs?: number;
};

export function HighlightCard({ title, description, icon: Icon, delayMs = 0 }: HighlightCardProps) {
  return (
    <article
      className="animate-fade-in-up rounded-3xl border border-white/60 bg-white/75 p-6 shadow-glow backdrop-blur"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2E417B] text-white">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-xl font-semibold text-[#2E417B]">{title}</h2>
      <p className="mt-3 leading-7 text-slate-600">{description}</p>
    </article>
  );
}