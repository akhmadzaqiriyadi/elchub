import { cn } from '@/lib/utils';

type BadgeVariant = 'free' | 'exclusive' | 'live' | 'success' | 'primary';
type BadgeSize = 'sm' | 'md' | 'lg';

const getVariantClasses = (variant: BadgeVariant = 'primary') => {
  const variants: Record<BadgeVariant, string> = {
    free: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold',
    exclusive: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300 font-semibold',
    live: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 font-semibold',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    primary: 'bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-300',
  };
  return variants[variant];
};

const getSizeClasses = (size: BadgeSize = 'md') => {
  const sizes: Record<BadgeSize, string> = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  return sizes[size];
};

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export function Badge({
  className,
  variant = 'primary',
  size = 'md',
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-medium',
        getVariantClasses(variant),
        getSizeClasses(size),
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </div>
  );
}
