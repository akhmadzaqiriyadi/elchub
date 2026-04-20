/**
 * Atomic footer link component
 * Individual footer link with hover states
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FooterLinkProps {
  label: string;
  href: string;
  className?: string;
}

export function FooterLink({ label, href, className }: FooterLinkProps) {
  const isExternal = href.startsWith('http');

  return isExternal ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'text-sm text-slate-600 hover:text-[#2E417B]',
        'dark:text-slate-400 dark:hover:text-slate-200',
        'transition-colors',
        className,
      )}
    >
      {label}
    </a>
  ) : (
    <Link
      href={href}
      className={cn(
        'text-sm text-slate-600 hover:text-[#2E417B]',
        'dark:text-slate-400 dark:hover:text-slate-200',
        'transition-colors',
        className,
      )}
    >
      {label}
    </Link>
  );
}
