/**
 * Atomic navbar link component
 * Used for individual navigation items
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavbarLinkProps {
  href: string;
  label: string;
  className?: string;
  isActive?: boolean;
}

export function NavbarLink({
  href,
  label,
  className,
  isActive = false,
}: NavbarLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'text-sm font-medium transition-colors',
        'text-[#2E417B] hover:text-[#1f2a52]',
        'dark:text-slate-300 dark:hover:text-slate-100',
        isActive && 'text-[#2E417B] font-semibold dark:text-slate-100',
        className,
      )}
    >
      {label}
    </Link>
  );
}
