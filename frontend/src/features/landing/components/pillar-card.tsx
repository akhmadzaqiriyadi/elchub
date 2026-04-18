import { cn } from '@/lib/utils';
import type { GrowthPillar } from '../types/pillar';

interface PillarCardProps extends React.HTMLAttributes<HTMLDivElement> {
  pillar: GrowthPillar;
}

export function PillarCard({ pillar, className }: PillarCardProps) {
  const Icon = pillar.icon;

  return (
    <article
      className={cn(
        'group rounded-lg border border-slate-200 bg-white p-8 transition-all hover:border-slate-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-600',
        className
      )}
    >
      {/* Icon */}
      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#2E417B] text-white transition-transform group-hover:scale-110 dark:bg-blue-600">
        <Icon className="h-6 w-6" />
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold text-[#2E417B] dark:text-white">{pillar.title}</h3>
      <p className="mt-3 text-slate-600 dark:text-slate-400">{pillar.description}</p>

      {/* Details */}
      <div className="mt-6 space-y-2">
        {pillar.details.map((detail, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs dark:bg-slate-700">
              ✓
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{detail}</p>
          </div>
        ))}
      </div>

      {/* Benefits */}
      <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Keuntungan
        </p>
        <div className="flex flex-wrap gap-2">
          {pillar.benefits.map((benefit, idx) => (
            <span
              key={idx}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {benefit}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
