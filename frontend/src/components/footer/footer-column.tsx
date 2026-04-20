/**
 * Footer column component
 * Renders a column with title and links
 */

import { FooterLink } from './footer-link';
import type { FooterColumn as FooterColumnType } from './footer.types';

interface FooterColumnProps {
  title: string;
  links: FooterColumnType['links'];
  className?: string;
}

export function FooterColumn({
  title,
  links,
  className,
}: FooterColumnProps) {
  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <FooterLink label={link.label} href={link.href} />
          </li>
        ))}
      </ul>
    </div>
  );
}
