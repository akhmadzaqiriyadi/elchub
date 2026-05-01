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
        'text-sm font-medium transition-colors whitespace-nowrap relative',
        isActive 
          ? 'text-[#2E417B] font-semibold dark:text-white border-b-2 border-[#2E417B] dark:border-white pb-0.5'
          : 'text-[#2E417B] hover:text-[#1f2a52] dark:text-slate-300 dark:hover:text-slate-100 pb-1.5',
        'px-2 py-1',
        className,
      )}
    >
      {label}
    </Link>
  );
}
