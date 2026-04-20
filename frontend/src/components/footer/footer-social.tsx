/**
 * Footer social media links component
 */

import { Instagram, Linkedin, Youtube } from 'lucide-react';
import type { FooterSocialLink } from './footer.types';

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: <Instagram className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
};

interface FooterSocialProps {
  links: FooterSocialLink[];
  className?: string;
}

export function FooterSocial({ links, className }: FooterSocialProps) {
  return (
    <div className={`flex gap-4 ${className || ''}`}>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.ariaLabel}
          className="text-slate-600 hover:text-[#2E417B] dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          title={link.label}
        >
          {SOCIAL_ICONS[link.icon]}
        </a>
      ))}
    </div>
  );
}
