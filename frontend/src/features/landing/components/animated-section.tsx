'use client';

import { useScrollAnimation } from '../hooks/use-scroll-animation';

interface AnimatedSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  ease?: string;
  className?: string;
}

/**
 * Wrapper component untuk automatic fade-up animation saat scroll
 * Gunakan component ini untuk membungkus section yang ingin di-animate
 */
export function AnimatedSection({
  children,
  delay = 0,
  duration = 0.8,
  ease = 'power2.out',
  className = '',
  ...props
}: AnimatedSectionProps) {
  const ref = useScrollAnimation({ delay, duration, ease });

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className} {...props}>
      {children}
    </div>
  );
}

/**
 * Wrapper untuk container dengan multiple animated children
 * Berikan attribute data-animate pada setiap child yang ingin di-animate dengan stagger
 */
export function AnimatedContainer({
  children,
  delay = 0,
  duration = 0.6,
  stagger = 0.1,
  ease = 'power2.out',
  className = '',
  ...props
}: AnimatedSectionProps & { stagger?: number }) {
  return (
    <div
      data-animate-container
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}
