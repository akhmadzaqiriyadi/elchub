import { cn } from '@/lib/utils';

type BadgeVariant = 'free' | 'exclusive' | 'live' | 'success' | 'primary';
type BadgeSize = 'sm' | 'md' | 'lg';

const getVariantClasses = (variant: BadgeVariant = 'primary') => {
  const variants: Record<BadgeVariant, string> = {
    free: 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-slate-300',
    exclusive: 'bg-yellow-50 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-300',
    live: 'bg-red-50 text-red-900 dark:bg-red-900/40 dark:text-red-300',
    success: 'bg-green-50 text-green-900 dark:bg-green-900/40 dark:text-green-300',
    primary: 'bg-blue-50 text-blue-900 dark:bg-blue-900/40 dark:text-blue-300',
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
