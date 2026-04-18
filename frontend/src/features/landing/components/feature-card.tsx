import { cn } from '@/lib/utils';
import type { EcosystemFeature } from '../types/pillar';

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  feature: EcosystemFeature;
}

export function FeatureCard({ feature, className }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <article
      className={cn(
        'group rounded-lg border border-slate-200 bg-white p-8 text-center transition-all hover:border-slate-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-600',
        className
      )}
    >
      {/* Icon */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-[#2E417B] transition-transform group-hover:scale-110 dark:from-slate-800 dark:to-slate-700 dark:text-blue-400">
          <Icon className="h-7 w-7" />
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-[#2E417B] dark:text-white">{feature.title}</h3>
      <p className="mt-3 text-slate-600 dark:text-slate-400">{feature.description}</p>
    </article>
  );
}
