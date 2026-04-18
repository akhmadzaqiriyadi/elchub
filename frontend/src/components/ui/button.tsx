import * as React from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary';
  size?: 'default' | 'lg';
  href?: string;
};

const buttonStyles = {
  default:
    'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20 focus-visible:ring-primary dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 dark:shadow-slate-100/20 dark:focus-visible:ring-slate-300',
  secondary:
    'bg-white text-primary border border-primary/20 hover:bg-primary/5 focus-visible:ring-primary/40 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-600',
};

const sizeStyles = {
  default: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-sm sm:text-base',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', href, ...props }, ref) => {
    const styles = cn(
      'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
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