import * as React from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  href?: string;
};

const buttonStyles = {
  default:
    'bg-[#2E417B] text-white hover:bg-[#23306a] shadow-sm shadow-blue-500/10 focus-visible:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700',
  secondary:
    'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  outline:
    'bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
  link:
    'bg-transparent text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500',
  danger:
    'bg-rose-500 text-white hover:bg-rose-600 shadow-sm shadow-rose-500/10 focus-visible:ring-rose-500',
};

const sizeStyles = {
  default: 'h-10 px-5 text-sm',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-12 px-8 text-base',
  icon: 'h-9 w-9 p-0',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', href, ...props }, ref) => {
    const styles = cn(
      'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
      buttonStyles[variant],
      sizeStyles[size],
      className,
    );

    if (href) {
      return (
        <Link href={href} className={styles}>
          {props.children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        className={styles}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';