import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface SectionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'default' | 'tight';
  background?: 'white' | 'light' | 'none';
}

export const SectionContainer = forwardRef<HTMLDivElement, SectionContainerProps>(
  ({
    className,
    children,
    size = 'default',
    background = 'white',
    ...props
  }, ref) => {
    const bgClasses = {
      white: 'bg-white dark:bg-slate-950',
      light: 'bg-slate-50 dark:bg-slate-900',
      none: '',
    };

    const paddingClasses = {
      default: 'py-8 sm:py-16 md:py-24',
      tight: 'py-8 sm:py-12 md:py-16',
    };

    return (
      <section
        ref={ref}
        className={cn(
          bgClasses[background],
          paddingClasses[size],
          'relative overflow-hidden',
          className
        )}
        {...props}
      >
        {children}
      </section>
    );
  }
);

SectionContainer.displayName = 'SectionContainer';

interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  centered = true,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-8 sm:mb-12 md:mb-16', centered && 'text-center', className)}>
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          'mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed',
          centered && 'mx-auto max-w-2xl'
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
