import { cn } from '@/lib/utils';
import type { HowItWorksStep } from '../types/pillar';

interface WorkStepProps extends React.HTMLAttributes<HTMLDivElement> {
  step: HowItWorksStep;
  isLast?: boolean;
}

export function WorkStep({ step, isLast = false, className }: WorkStepProps) {
  const Icon = step.icon;

  return (
    <div className={cn('relative flex gap-6 sm:gap-8', className)}>
      {/* Left: Step number and icon */}
      <div className="flex flex-col items-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#2E417B] bg-[#2E417B] text-xl font-bold text-white dark:border-blue-600 dark:bg-blue-600">
          {step.step}
        </div>
        {!isLast && (
          <div className="h-24 w-1 bg-gradient-to-b from-slate-200 to-transparent dark:from-slate-700" />
        )}
      </div>

      {/* Right: Content */}
      <div className="flex flex-col justify-center pb-4">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-[#2E417B] dark:bg-slate-800 dark:text-blue-400">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-semibold text-[#2E417B] dark:text-white">{step.title}</h3>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{step.description}</p>
      </div>
    </div>
  );
}
